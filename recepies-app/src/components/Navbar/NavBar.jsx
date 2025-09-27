import styles from './NavBar.module.css'
import Button  from '../Button/Button';

function NavBar({sections = []}) {

    return (
        <header className={styles.whole}>
        {sections.map((section, index) => (
                <Button 
                    key={index} 
                    title={section.title} 
                    onClick={section.onClick} 
                    className={styles.buttonStyle}
                />
            ))}
        </header>
    );
}

export default NavBar;