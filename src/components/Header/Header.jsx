import Invesco from '../../assests/Images/invesco.png';
import './Header.css'

function CustomHeader() {
    return (
        <div className='headerClass'>
            <img src={Invesco} className='invesco-logo' alt='Invesco' />
            <div className='header-text'>Product Management System</div>
        </div>
    );
}

export default CustomHeader