import axios from "axios";
import { useEffect, useState } from "react";
import SingleFunction from "../components/layout/SingleFunction"
import { apiURL } from "../utils/VariableName";
import moment from 'moment';

const Ranking = () => {
    const [problems, setProblems] = useState([]);
    const [users, setUsers] = useState([]);

    const getData = async () => {
        const response = await axios.get(`${apiURL}/judge/getRanking`);
        const problems = response.data.payload.problems;
        setProblems(problems);
        const mp = [];

        for (let i = 0; i < problems.length; i++) {
            mp[problems[i]] = i;
        }

        const users = [];

        let lastPoint = -1, index = 0;

        for (const u of response.data.payload.users) {
            const arr = Array(problems.length).fill('∄');
            for (const p of u.details) {
                arr[mp[p.name]] = p.point;
            }

            if (lastPoint !== u.total) {
                lastPoint = u.total;
                index++;
            }

            users.push({
                index,
                username: u.username,
                total: u.total,
                details: arr
            });
        }

        setUsers(users);
    }

    useEffect(() => {
        getData();
    }, []);

    const content = (
        <div className="mx-6">
            <div className="text-3xl font-semibold font-mont my-5">
                Ranking
            </div>

            <div className="my-5 font-mont text-lg mx-3 italic">
                Update: {moment().format('LLL')}
            </div>

            <div className="mx-3 overflow-x-auto my-5 rounded flex">
                <table className="table-auto mb-2 flex-1 border-2">
                    <thead className="font-mont text-lg bg-gray-100 border-2">
                        <tr>
                            <th className="p-2">Rank</th>
                            <th className="px-2 border-l-2">Username</th>
                            <th className="border-x-2 px-2">Total</th>
                            {
                                problems.map(p => (
                                    <th className="px-2 border-x-2">{p}</th>
                                ))
                            }
                        </tr>

                    </thead>
                    <tbody className="">
                        {
                            users.map(u => (
                                <tr className="odd:bg-white even:bg-slate-100 h-12">
                                    <td className="text-center py-1 w-20">{u.index}</td>
                                    <td className="border-l-2 px-4 font-mont font-medium">{u.username}</td>
                                    <td className="border-x-2 text-center font-bold">{u.total}</td>
                                    {
                                        u.details.map(d => (
                                            <td className="text-center border-x-2">{d}</td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <SingleFunction
            content={content}
            func='ranking'
        />
    )
}

export default Ranking
