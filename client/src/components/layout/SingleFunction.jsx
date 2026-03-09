import NavBar from "./NavBar";

const SingleFunction = ({content,func}) => {
    return (
        <div className='h-screen flex justify-center'>
            <NavBar choose={func} />
            <div className="flex-1 bg-white my-4 mr-4 rounded-lg overflow-y-scroll hide-scroll">
                {content}
            </div>
        </div>
    );
}

export default SingleFunction;