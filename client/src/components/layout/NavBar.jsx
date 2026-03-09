import NavButton from '../items/NavButton';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';
import submitSvg from '../../assets/paper-plane-solid.svg';
import attachSvg from '../../assets/paperclip-solid.svg';
import rankSvg from '../../assets/ranking-star-solid.svg';
import logoutSvg from '../../assets/right-from-bracket-solid.svg';
import logoPng from '../../assets/logo192.png';

const NavBar = ({choose}) => {
    const buttons = [
        {
            link:'',
            img: submitSvg,
            alt:'Submit'
        },
        {
            link:'attachments',
            img: attachSvg,
            alt:'Attachments'
        },
        {
            link:'ranking',
            img: rankSvg,
            alt:'Ranking'
        }
    ];

    const {authState: {authLoading, isAuthenticated}} = useContext(AuthContext);

    if(authLoading) {
        return null;
    }

    const funcbtn = isAuthenticated ? (
        <>
            <div className='flex-1 flex flex-col justify-center gap-7'>
                {
                    buttons.map(b => (
                        <NavButton key={b.alt} data={b} choose={choose===b.link} />
                    ))
                }
            </div>
            
            <a href='/logout'>
                <div className='group border-r-4 border-r-[#180600]'>
                    <img src={logoutSvg} alt='Logout' className='w-1/4 mx-auto off-button group-hover:off-button-hover duration-200' />

                    <div className='text-[#50423E] group-hover:text-[#B2ABAA] duration-200 text-center font-medium text-sm font-mont'>
                        Logout
                    </div>
                </div>
            </a>
        </>
    ) : null;

    return (
        <div className="w-[8%] flex flex-col my-5 justify-center">
            <img src={logoPng} alt='Logo' className="w-1/2 mx-auto" />
            {funcbtn}
        </div>
    );
}

export default NavBar;