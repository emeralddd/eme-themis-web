import NavBar from "./NavBar";

const DoubleFunction = ({content1,content2,func}) => {
    return (
        <div className='h-screen flex justify-center'>
            <NavBar choose={func} />
            <div className="w-[27%] bg-gray-100 my-4 rounded-l-lg text-2xl overflow-y-scroll hide-scroll">
                {content1}
            </div>
            <div className="flex-1 bg-white my-4 mr-4 rounded-r-lg text-2xl overflow-y-scroll hide-scroll">
                {content2}
            </div>
        </div>
    );
}

export default DoubleFunction;