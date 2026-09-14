import { randomUUID } from 'crypto';
import { Router } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { rm } from 'fs/promises';
import path from 'path';
import { getGameCover, isOwner, slugForMedia } from '../database/games/Games';
import { logError } from '../Logger';

const BYTE_CONVERSION = 1024;

const mediaServer = Router();

interface PendingFileData {
    file: UploadedFile;
    workflow: string;
    timeout: NodeJS.Timeout;
}

const pendingFiles: Record<string, PendingFileData> = {};

const pendFile = (file: UploadedFile, workflow: string) => {
    const id = `${randomUUID()}${path.extname(file.name)}`;
    pendingFiles[id] = {
        file,
        workflow,
        timeout: setTimeout(
            () => {
                delete pendingFiles[id];
            },
            5 * 60 * 1000,
        ),
    };
    return id;
};

export const saveFile = async (id: string) => {
    const pendingFile = pendingFiles[id];
    if (!pendingFile) {
        return false;
    }

    const { file, workflow, timeout } = pendingFile;

    clearTimeout(timeout);

    const success = await new Promise((resolve) => {
        file.mv(path.resolve('media', workflow, id), (err) => {
            if (err) {
                resolve(false);
            } else {
                delete pendingFiles[id];
                resolve(true);
            }
        });
    });

    return success;
};

export const deleteFile = async (workflow: string, id: string) => {
    try {
        await rm(path.resolve('media', workflow, id));
        return true;
    } catch (e: any) {
        if ('message' in e) {
            logError(e.message);
        } else {
            logError('Unknown error deleting file');
        }
        return false;
    }
};

mediaServer.use(fileUpload());

mediaServer.post('/', (req, res) => {
    if (!req.files || Object.keys(req.files).length !== 1) {
        res.status(400).send('Invalid number of files uploaded');
        return;
    }

    const { workflow } = req.body;
    if (!workflow) {
        res.status(400).send('Missing file workflow');
        return;
    }

    const file = req.files.file;
    if (Array.isArray(file)) {
        res.status(400).send('Too many files uploaded');
        return;
    }
    const maxSize =
        workflow === 'goalImage'
            ? 100 * BYTE_CONVERSION
            : BYTE_CONVERSION * BYTE_CONVERSION;
    if (file.size > maxSize) {
        res.sendStatus(400);
    }

    const id = pendFile(file, workflow);

    res.status(200).send({ id });
});

mediaServer.delete('/pending/:id', (req, res) => {
    const { id } = req.params;

    if (!pendingFiles[id]) {
        res.status(400).send('File does not exist');
        return;
    }

    delete pendingFiles[id];

    res.sendStatus(200);
});

mediaServer.delete(':workflow/:id', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }

    const { workflow, id } = req.body;

    // ensure this action is allowed based on the workflow and file
    switch (workflow) {
        case 'game':
            // determine what game owns the media
            const slug = await slugForMedia(id);
            // make sure te game actually exists
            if (!slug) {
                res.sendStatus(404);
                return;
            }
            // ensure the user has permission to remove the media
            if (!(await isOwner(slug, req.session.user))) {
                res.sendStatus(403);
                return;
            }
            break;
        default:
            res.status(400).send('Invalid media workflow');
    }

    if (!deleteFile(workflow, id)) {
        res.sendStatus(404);
        return;
    }

    res.sendStatus(200);
});

mediaServer.get('/gameCover/:slug', async (req, res) => {
    const { slug } = req.params;
    const cover = await getGameCover(slug);
    if (cover) {
        res.redirect(`/media/game/${cover}`);
    } else {
        res.sendStatus(404);
    }
});

export default mediaServer;
