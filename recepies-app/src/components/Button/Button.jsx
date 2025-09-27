import styles from './Button.module.css'

function Button({title="Кнопка", onClick=(() => {})}) {
    return(<button className={styles.button} onClick={onClick}>{title}</button>);
}

export default Button