import axios from "axios";
import { useEffect, useState } from "react";
import SingleFunction from "../components/layout/SingleFunction"
import { apiURL } from "../utils/VariableName";
import moment from 'moment';
import { useQuery } from "@tanstack/react-query";

const Ranking = () => {

    const indexCandidates = (payload) => {
        const problems = payload.problems.sort((a, b) => a.localeCompare(b));

        const problemMap = {};

        problems.forEach((problem, index) => {
            problemMap[problem] = index;
        });

        const usersData = payload.users
        
        const users = usersData.map(user => {
            const resultRow = Array(problems.length).fill('∄');
            const totalPoint = user.problems.reduce((acc, problem) => acc + problem.score, 0);
            user.problems.forEach(problem => {
                resultRow[problemMap[problem.name]] = problem.score;
            });
            
            return {
                username: user.username,
                total: totalPoint,
                details: resultRow
            };
        }).sort((a, b) => b.total - a.total || a.username.localeCompare(b.username));
        
        users.forEach((user, index) => {
            if (index === 0 || user.total !== users[index - 1].total) {
                user.index = index + 1;
            } else {
                user.index = users[index - 1].index;
            }
        });

        return {
            problems,
            users
        }
    }

    const getDataForRanking = async () => {
        const response = await axios.get(`${apiURL}/judge/getRanking`);
        return response.data.payload;
    }

    const { data: rankingData, isLoading } = useQuery({
        queryKey: ['ranking'],
        queryFn: getDataForRanking,
        select: indexCandidates,
        staleTime: 60000
    });

    const problems = rankingData?.problems || [];
    const users = rankingData?.users || [];

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
                                problems.map((p,index) => (
                                    <th key={index} className="px-2 border-x-2">{p}</th>
                                ))
                            }
                        </tr>

                    </thead>
                    <tbody className="">
                        {
                            users.map((u, userIndex) => (
                                <tr key={userIndex} className="odd:bg-white even:bg-slate-100 h-12">
                                    <td className="text-center py-1 w-20">{u.index}</td>
                                    <td className="border-l-2 px-4 font-mont font-medium">{u.username}</td>
                                    <td className="border-x-2 text-center font-bold">{u.total}</td>
                                    {
                                        u.details.map((d, index) => (
                                            <td key={index} className="text-center border-x-2">{d}</td>
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
