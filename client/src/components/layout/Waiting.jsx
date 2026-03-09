const Waiting = () => {
    return (
        <div className='h-screen flex justify-center'>
            <div className='flex flex-col justify-center gap-5'>
                <div className="load-spin rounded-full h-32 w-32 border-[16px] border-white border-t-[16px] border-t-yellow-400"></div>
                <div className='text-center text-white font-normal font-mont text-2xl'>
                    Loading ...
                </div>
            </div>
        </div>
    );
}

export default Waiting;