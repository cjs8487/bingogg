import { Prisma } from "@prisma/client";

// never delete a room, just set status to 'ARCHIVED'
// this overrides default prisma.room.delete behavior
export const overrideRoomDeletion = Prisma.defineExtension({
    name: 'overrideRoomDeletion',
    query: {
        room: {
            async delete({ args, query }) {
                // Transform delete to update by setting status to 'ARCHIVED'
                const updateArgs = {
                    where: args.where,
                    data: { status: 'ARCHIVED' },
                };
                return query({ ...args, action: 'update', args: updateArgs });
            },
        },
    },
});