import { Router } from 'express';
import { racetimeClientId, racetimeHost } from '../../Environment';

const connect = Router();

const rtScopes = ['read', 'race_action', 'create_race'];

connect.get('/racetime', (req, res) => {
    res.redirect(
        `${racetimeHost}/o/authorize?client_id=${racetimeClientId}&response_type=code&scope=${rtScopes.join(
            '+',
        )}`,
    );
});

export default connect;
