import axios from "axios";
import { useEffect, useState } from "react";
import SingleFunction from "../components/layout/SingleFunction"
import { apiURL } from "../utils/VariableName";
import moment from 'moment';
import { Buffer } from 'buffer';
import { saveAs } from 'file-saver';

const Attachments = () => {
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [path, setPath] = useState('./');

    const listDir = async (newPath) => {
        const response = await axios.get(`${apiURL}/files/getAttachments/?path=${newPath}`);
        setFiles(response.data.payload.files);
        setFolders(response.data.payload.folders);
        setPath(newPath);
    }

    useEffect(() => {
        listDir('./');
    }, []);

    const save = async (name) => {
        const response = await axios.get(`${apiURL}/files/getAttachmentBuffer/?path=${path}/${name}`);
        saveAs(new Blob([Buffer.from(response.data.payload)]), name);
    }

    const returnPath = (i) => {
        const tmp = path.split('/');

        if (i + 1 === tmp.length) return;

        let newPath = "";
        for (let j = 0; j <= i; j++) {
            newPath += tmp[j];
            newPath += "/";
        }

        listDir(newPath);
    }

    const extension = {
        xls: 'fa-file-excel',
        xlsx: 'fa-file-excel',
        ppt: 'fa-file-powerpoint',
        pptx: 'fa-file-powerpoint',
        doc: 'fa-file-word',
        docx: 'fa-file-word',
        zip: 'fa-file-zipper',
        rar: 'fa-file-zipper',
        pdf: 'fa-file-pdf',
        cpp: 'fa-file-code',
        c: 'fa-file-code',
        pas: 'fa-file-code',
        java: 'fa-file-code',
        js: 'fa-file-code',
        py: 'fa-file-code'
    };

    const content = (
        <div className="mx-6">
            <div className="text-3xl font-semibold font-mont my-5">
                Attachments
            </div>

            <div className="my-5 font-mont text-lg mx-3 flex">
                {
                    path.split('/').map((d, i) => d && (
                        <div key={`dir${i}`} className="hover:font-semibold hover:cursor-pointer px-2" onClick={returnPath.bind(this, i)}>
                            {d}
                            <span className="ml-2">/</span>
                        </div>
                    ))
                }
            </div>

            <div className="mx-3 my-5 rounded flex">
                <table className="table-fixed mb-2 flex-1">
                    <thead className="font-mont text-lg bg-gray-100 border-2">
                        <tr>
                            <th className="p-2">Name</th>
                            <th className="px-2 w-52">Size</th>
                            <th className="px-2 w-96">Created date</th>
                        </tr>
                    </thead>
                    <tbody className="text-lg">
                        {
                            folders.length + files.length === 0 ?
                                (
                                    <tr className="bg-white hover:bg-slate-100 group border-2">
                                        <td className="pl-5 py-1 text-center italic">
                                            empty
                                        </td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                ) : null
                        }

                        {
                            folders.map((f, i) => (
                                <tr key={i} className="bg-white hover:bg-slate-100 group border-2 hover:cursor-pointer" onClick={listDir.bind(this, `${path}${f.name}/`)}>
                                    <td className="pl-5 py-1">
                                        <i className="fa-solid fa-folder mx-3 w-5 text-center"></i>
                                        {f.name}
                                    </td>
                                    <td></td>
                                    <td className="text-center">{moment(f.date).format('lll')}</td>
                                </tr>
                            ))
                        }

                        {
                            files.map((f, i) => {
                                const ext = f.name.split('.').reverse()[0];
                                const size = f.size;
                                return (
                                    <tr key={i} className="bg-white hover:bg-slate-100 group border-2 hover:cursor-pointer" onClick={save.bind(this, f.name)}>
                                        <td className="pl-5 py-1">
                                            <i className={`fa-solid ${extension[ext] ? extension[ext] : 'fa-file'} mx-3 w-5 text-center`}></i>
                                            {f.name}
                                        </td>
                                        <td className="text-center">
                                            {size <= 1 ? `${size} byte` :
                                                size < 1024 ? `${size} bytes` :
                                                    size < 1048576 ? `${(size / 1024).toFixed(2)} KB` :
                                                        size < 1073741824 ? `${(size / 1048576).toFixed(2)} MB` : `${(size / 1073741824).toFixed(2)} GB`}
                                        </td>
                                        <td className="text-center">{moment(f.date).format('lll')}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <SingleFunction
            content={content}
            func='attachments'
        />
    )
}

export default Attachments
