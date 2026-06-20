import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../contexts/authContext";
import axios from "axios";
import { apiURL, hostURL } from "../utils/VariableName";
import socketIOClient from "socket.io-client";
import Waiting from "../components/layout/Waiting";
import DoubleFunction from "../components/layout/DoubleFunction";
import Prism from "prismjs";
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import { useQuery } from "@tanstack/react-query";

const WorkingArea = () => {
    const { authState: { authLoading, user } } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [log, setLog] = useState(null);

    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = socketIOClient.connect(hostURL);

        socketRef.current.on('reload', dataGot => {
            //console.log('reload' + dataGot);
            if (dataGot.data === user.username) {
                window.location.reload(false);
            }
        });

        return () => {
            //console.log('disconnect');
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        Prism.highlightAll();
    }, [log]);

    const getProblems = async () => {
        const response = await axios.get(`${apiURL}/judge/getUserProblems`);
        console.log(response.data.payload);
        return response.data.payload;
    }

    const { data: problemData, isLoading } = useQuery({
        queryKey: ['problems'],
        queryFn: getProblems,
        staleTime: 60000
    });

    const onChangeFile = event => {
        setFile(event.target.files[0]);
    };

    const onClickChangeLog = (problem, event) => {
        setLog(problem);
    };

    const upload = async (event) => {
        event.preventDefault();
        const data = new FormData();
        data.append('file', file, file.name);

        const response = await axios.post(`${apiURL}/judge/submit`, data);

        if (!response.data.success) {
            console.log(response.data.message);
        }
    };

    if (authLoading) {
        return (
            <Waiting />
        );
    }

    // status: 0 - waiting for judger, 1 - judging, 2 - judged, 3 - ℱ, 4- ⚠, 5 - C

    const bg = ['bg-[#180600]', 'bg-[#180600]', 'bg-green-400', 'bg-yellow-400', 'bg-red-400', 'bg-gray-400'];
    const sta = ['', '', '', 'ℱ', '⚠', ''];
    const strSta = ['Đang chờ máy chấm', 'Đang chấm', 'Đã chấm', 'Dịch bị lỗi', 'Lỗi nghiêm trọng', 'Chưa chấm'];

    const problems = problemData || [];

    const content1 = (
        <div className="mx-6">
            <div className="text-3xl font-semibold font-mont my-5">
                Tasks
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor='file' className=''>
                    <div className="bg-[#180600] border-2 border-[#180600] hover:bg-white hover:border-[#180600] text-white hover:text-[#180600] font-medium p-1 text-center text-base font-mont rounded-md hover:cursor-pointer duration-200">
                        {file ? file.name : 'Choose File'}
                    </div>
                </label>

                <input id='file' type='file' style={{ display: 'none' }} onChange={onChangeFile} />

                <button className={`bg-[#180600] border-2 border-[#180600] hover:bg-white hover:border-[#180600] text-white hover:text-[#180600] font-medium p-1 text-center text-base font-mont rounded-md hover:cursor-pointer ${file ? `block` : `hidden`} duration-200`} onClick={upload}>
                    Submit
                </button>
            </div>

            <div className="my-6">
                <hr className="border border-[#acacacc8]" />
            </div>

            <div className="flex flex-col gap-2">
                {
                    problems.map((problem, i) => (
                        <div className={`${log && log.name === problem.problem ? `bg-gray-200` : `bg-white`} font-bold border border-slate-300 flex flex-col rounded p-2 hover:cursor-pointer overflow-y-auto`} onClick={onClickChangeLog.bind(this, problem)} >
                            <div className='flex gap-4'>
                                <div className={`${bg[problem.status]} rounded w-20 flex items-center justify-center`}>
                                    {
                                        problem.status === 1 ? (
                                            <div className="load-spin rounded-full h-8 w-8 border-[8px] border-white border-t-[8px] border-t-yellow-400"></div>
                                        ) : (
                                            <div className="">
                                                {problem.status === 2 ? problem.score : sta[problem.status]}
                                            </div>
                                        )
                                    }
                                </div>

                                <div className="font-mont flex flex-col">
                                    <div className="text-lg">
                                        {problem.problem}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        MD5: {problem.md5}
                                    </div>
                                    {/* <div className="text-xs text-gray-400">
                                        Attemps: {problem.attemps}
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

            <div className="mb-5">

            </div>
        </div>
    )

    const content2 = log ? (
        <>
            <div className="mx-6 flex flex-col gap-5 mt-5">
                <pre className="h-96 text-base rounded">
                    <code className="language-cpp">
                        {log.fileContent}
                    </code>
                </pre>

                <div>
                    <div className="font-mont font-bold text-3xl">
                        {log.problem}
                    </div>

                    <div className="text-base text-gray-400">
                        MD5: {log.md5}
                    </div>

                    {/* <div className="text-base text-gray-400">
                        Attemps: {log.attemps}
                    </div> */}
                </div>

                <div className="flex gap-4">
                    <div className={`${bg[log.status]} rounded py-5 flex justify-center items-center w-20 font-semibold`}>
                        {
                            log.status === 1 ? (
                                <div className="load-spin rounded-full h-12 w-12 border-[8px] border-white border-t-[8px] border-t-yellow-400"></div>
                            ) : (
                                <div className="">
                                    {log.status === 2 ? log.score : sta[log.status]}
                                </div>
                            )
                        }
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="text-lg font-bold font-mont">
                            Status
                        </div>
                        <div className="font-bold">
                            {strSta[log.status]}
                        </div>
                    </div>
                </div>

                <div className="font-mont font-bold text-2xl">
                    Log
                </div>

                <div className="border-2 text-lg border-gray-200 rounded px-5 py-3 mb-5 whitespace-pre-line">
                    {log.logs}
                </div>
            </div>
        </>
    ) : null;

    return (
        <>
            <DoubleFunction
                content1={content1}
                content2={content2}
                func=''
            />

        </>
    );
}

export default WorkingArea;
