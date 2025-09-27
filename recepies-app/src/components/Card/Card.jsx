import React from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css'

const Card = ({ name, url, ingredients }) => {
    console.log(ingredients.length)
    for(var i = 0; i < ingredients.length; i++) {
        console.log(ingredients[i])
    }
    
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>{name}</h2>
            <a href={url} className={styles.link} target="_blank" rel="noopener noreferrer">
                {url}
            </a>
            <h3 className={styles.ingredientsTitle}>Ingredients:</h3>
            <ul className={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                    <li key={index} className={styles.ingredientItem}>
                        {typeof ingredient === 'object' ? ingredient.name : ingredient}
                    </li>
                ))}
            </ul>
        </div>
    );
};

Card.propTypes = {
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    ingredients: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Card;