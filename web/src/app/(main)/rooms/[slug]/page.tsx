'use client';
import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import TextFit from '../../../../components/TextFit';

const board = [
    [
        'Collect 5 things',
        'Talk to 10 people',
        'A pointy device',
        'Obtain a hammer',
        'YELL',
    ],
    ['10 Wells', '15 flames', 'Beat the game', 'Die 10 times', 'Beat 5-2'],
    [
        'Beat 3-5',
        'Discover Persia',
        'Invent Religion',
        'C O N Q U E S T',
        'this is a really long goal name because sometimes these will exist and it needs to be tested against',
    ],
    [
        'Return to Madagascar',
        'Morph Ball',
        '500 HP',
        '50 coins',
        'Have a civil war',
    ],
    ['Game over', 'Kill 300 enemies', 'Explosives', 'Compass', 'Roads'],
];

export default function Room({
    params: { slug },
}: {
    params: { slug: string };
}) {
    const [boardState, setBoardState] = useState([
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
    ]);
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [authToken, setAuthToken] = useState();

    const { sendMessage, readyState, lastMessage, getWebSocket } = useWebSocket(
        `ws://localhost:8000/rooms/${slug}`,
    );

    useEffect(() => {
        if (lastMessage !== null) {
            setMessages((prev) => [...prev, lastMessage.data]);
        }
    }, [lastMessage, setMessages]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Disconnected',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const toggleSpace = (row: number, col: number) => {
        setBoardState(
            boardState.map((rowData, rowIndex) => {
                if (rowIndex == row) {
                    return rowData.map((colData, colIndex) => {
                        if (colIndex === col) {
                            return !colData;
                        }
                        return colData;
                    });
                }
                return rowData;
            }),
        );
    };

    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');

    // if (!authToken) {
    //     return (
    //         <div className="flex flex-col gap-y-4">
    //             <label>
    //                 Nickname
    //                 <input
    //                     className="text-black"
    //                     value={nickname}
    //                     onChange={(event) => setNickname(event.target.value)}
    //                 />
    //             </label>
    //             <label>
    //                 Password
    //                 <input
    //                     type="password"
    //                     className="text-black"
    //                     value={password}
    //                     onChange={(event) => setPassword(event.target.value)}
    //                 />
    //             </label>
    //             <button
    //                 type="submit"
    //                 className="bg-gray-200 text-black"
    //                 onClick={async () => {
    //                     const res = await fetch(
    //                         `http://localhost:8000/api/rooms/${slug}/authorize`,
    //                         {
    //                             method: 'POST',
    //                             headers: { 'Content-Type': 'application/json' },
    //                             body: JSON.stringify({ nickname, password }),
    //                         },
    //                     );
    //                     const token = await res.json();
    //                     setAuthToken(token.authToken);
    //                     sendMessage(
    //                         JSON.stringify({
    //                             action: 'join',
    //                             authToken: token.authToken,
    //                         }),
    //                     );
    //                 }}
    //             >
    //                 Join Room
    //             </button>
    //         </div>
    //     );
    // }

    const colors = [
        'indigo',
        'darkorange',
        'maroon',
        // 'purple',
        // 'forestgreen',
        // 'aqua',
        // 'violet',
        // 'red',
        // 'white',
        // 'lime',
        // 'gray',
        // 'yellow',
        // '#2d587e',
        // '#54f7e5',
        // '#548715',
        // '#58fe87',
        // '#5e8a78',
        // '#54a841',
        // '#a7e452',
        // '#157854',
    ];
    const colorPortion = 360 / colors.length;

    return (
        <div className="flex gap-x-8">
            <div className="block w-1/2">
                {board.map((row, rowIndex) => (
                    <div
                        key={row.join()}
                        className="flex w-full items-center justify-center text-center"
                    >
                        {row.map((goal, colIndex) => (
                            <div
                                key={goal}
                                // className={`${
                                //     boardState[rowIndex][colIndex]
                                //         ? 'bg-red-500'
                                //         : ''
                                // } aspect-square w-1/5 cursor-pointer border p-4 hover:bg-gray-300 hover:bg-opacity-25`}
                                className="relative aspect-square w-1/5 overflow-hidden border"
                                onClick={() => toggleSpace(rowIndex, colIndex)}
                            >
                                <div className="absolute z-10 flex h-full w-full items-center justify-center p-2">
                                    <TextFit
                                        text={goal}
                                        className=" bg-gray-700 bg-opacity-50 p-1"
                                    />
                                </div>
                                {colors.map((color, index) => (
                                    <div
                                        key={color}
                                        className="absolute h-full w-full"
                                        style={{
                                            backgroundImage: `conic-gradient(from ${
                                                colorPortion * index
                                            }deg, ${color} 0deg, ${color} ${colorPortion}deg, rgba(0,0,0,0) ${colorPortion}deg)`,
                                        }}
                                    />
                                ))}
                                {/* <div className="box absolute h-full w-full origin-top skew-x-[-0.84007rad] bg-green-400" /> */}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="grow" />
            <div className="flex flex-col border px-2 py-2">
                <div>Socket Status: {connectionStatus}</div>
                <div className="h-96 overflow-y-scroll">
                    {messages.map((message, index) => (
                        <div key={`${message}-${index}`}>{message}</div>
                    ))}
                </div>
                <div className="flex gap-x-2 text-black">
                    <input
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyUp={(event) => {
                            if (event.key === 'Enter') {
                                sendMessage(message);
                                setMessage('');
                            }
                        }}
                        className="grow"
                    />
                    <button
                        className="bg-gray-200 px-2 py-2"
                        onClick={() => {
                            sendMessage(message);
                            setMessage('');
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
