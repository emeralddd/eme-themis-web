import { Link } from 'react-router-dom';

const NavButton = ({data,choose}) => {
    return (
        <Link to={`/${data.link}`}>
            <div className={`group border-r-4 ${choose?'border-r-[#B2ABAA]':'border-r-[#180600]'}`}>
                <img src={data.img} alt={data.alt} className={`w-1/4 mx-auto ${choose?'off-button-hover':'off-button group-hover:off-button-hover'} duration-200`} />

                <div className={`${choose?'text-[#B2ABAA]':'text-[#50423E] group-hover:text-[#B2ABAA]'} duration-200 text-center font-medium text-sm font-mont`}>
                    {data.alt}
                </div>
            </div>
        </Link>
    );
}

export default NavButton;