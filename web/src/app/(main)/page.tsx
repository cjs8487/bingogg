import RoomCreateForm from '@/components/RoomCreateForm';

export default async function Home() {
    return (
        <>
            <div className="pb-4">Welcome to bingo.gg</div>
            <div className="flex flex-col items-center justify-center gap-y-4 rounded-md border p-4 shadow-lg">
                <div className="text-4xl">Create a Room</div>
                <RoomCreateForm />
            </div>
        </>
    );
}
