import React, { useState, useEffect } from 'react';
import 'antd/dist/reset.css';
import { Form, Button, Input, Select, Radio, message, Modal } from 'antd';
import './App.css';
import NavBar from './components/Navbar/NavBar';
import Card from './components/Card/Card';

const { Option } = Select;

// Utility function to filter suggestions based on input value
const getSuggestions = (items, value) =>
  value
    ? items.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
    : [];

// Reusable InputWithSuggestions component for both ingredients and methods
const InputWithSuggestions = ({
  inputValue,
  suggestions,
  onInputChange,
  onAddItem,
  onKeyDown,
  placeholder,
  suggestionStyle,
}) => (
  <>
    <Input
      value={inputValue}
      onChange={onInputChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{ marginBottom: '10px' }}
    />
    {suggestions.map((word) => (
      <div
        key={word}
        onClick={() => onAddItem(word)}
        style={{
          cursor: 'pointer',
          padding: '5px',
          backgroundColor: '#f0f0f0',
          marginBottom: '5px',
          ...suggestionStyle,
        }}
      >
        {word}
      </div>
    ))}
  </>
);

// Reusable TagList component for displaying added items with removal
const TagList = ({ items, onRemove, bgColor, textColor = 'black' }) => (
  <div>
    {items.map((word) => (
      <span
        key={word}
        style={{
          display: 'inline-block',
          margin: '5px',
          padding: '5px 10px',
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: '5px',
          position: 'relative',
        }}
      >
        {word}
        <span
          onClick={() => onRemove(word)}
          style={{
            marginLeft: '10px',
            cursor: 'pointer',
            color: 'black',
            fontWeight: 'bold',
          }}
        >
          ✕
        </span>
      </span>
    ))}
  </div>
);

export default function App() {
  const [ingredients, setIngredients] = useState([
    'Бекон', 'Брокколи', 'Вода', 'Зеленый горох', 'Итальянские травы',
    'Капуста', 'Картофель', 'Кефир', 'Колбаса', 'Крабовые палочки',
    'Крахмал', 'Креветки', 'Курица', 'Лавровый лист', 'Лимон',
    'Лук', 'Лук зеленый', 'Лук порей', 'Майонез', 'Макароны',
    'Масло растительное', 'Масло сливочное', 'Морковь', 'Мука',
    'Оливковое масло', 'Паприка', 'Перец', 'Перец черный', 'Помидоры',
    'Рис', 'Розмарин', 'Розовый перец', 'Сахар', 'Сливки', 'Сметана',
    'Сода', 'Соевый соус', 'Соль', 'Сосиски', 'Специи', 'Сыр',
    'Сыр плавленый', 'Творог', 'Тесто слоеное', 'Тимьян', 'Томатная паста',
    'Тортилья', 'Укроп', 'Фарш', 'Чеснок', 'Яйцо куриное',
  ]);

  const [cookingMethods, setCookingMethods] = useState([
    'Жарка', 'Варка', 'Тушение', 'Запекание', 'Нарезка',
  ]);

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // Fetch data on mount
  useEffect(() => {
    // Проверяем, есть ли токен в localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Декодируем JWT (без проверки подписи — только для UI)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp > now) {
          setCurrentUser({
            username: payload.sub,
            roles: payload.roles || [],
            token: token,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }

    const fetchData = async () => {
      try {
        const ingredientsResponse = await fetch('/api/all_ingredients');
        if (ingredientsResponse.ok) {
          const ingredientsData = await ingredientsResponse.json();
          if (Array.isArray(ingredientsData) && ingredientsData.length > 0) {
            setIngredients(ingredientsData);
          }
        }

        const methodsResponse = await fetch('/api/all_cook_processes');
        if (methodsResponse.ok) {
          const methodsData = await methodsResponse.json();
          if (Array.isArray(methodsData) && methodsData.length > 0) {
            setCookingMethods(methodsData);
          }
        }
      } catch (error) {
        console.error('Error fetching ', error);
      }
    };

    fetchData();
  }, []);

  // === АВТОРИЗАЦИЯ ===

  const handleLogin = async (values) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.text();
        message.error(`Ошибка входа: ${error}`);
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser({
        username: data.username,
        roles: data.roles,
        token: data.token,
      });
      setIsLoginModalOpen(false);
      message.success('Вход выполнен!');
    } catch (error) {
      message.error('Ошибка при входе');
    }
  };

  const handleRegister = async (values) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.text();
        message.error(`Ошибка регистрации: ${error}`);
        return;
      }

      message.success('Регистрация успешна! Войдите.');
      setIsRegisterModalOpen(false);
    } catch (error) {
      message.error('Ошибка при регистрации');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    message.success('Вы вышли из системы');
  };

  // === ОСТАЛЬНОЙ КОД (без изменений, кроме кнопок в NavBar) ===

  // Search State
  const [inputIncludeIngredient, setIncludeIngredientInput] = useState('');
  const [inputExcludeIngredient, setExcludeIngredientInput] = useState('');
  const [suggestedWordsIncludeIngredient, setSuggestedIncludeIngredientsWords] = useState([]);
  const [suggestedWordsExcludeIngredient, setSuggestedExcludeIngredientsWords] = useState([]);
  const [includedIngredientsList, setIncludedIngredientsList] = useState([]);
  const [excludedIngredientsList, setExcludedIngredientsList] = useState([]);

  const [inputIncludeMethod, setIncludeMethodInput] = useState('');
  const [inputExcludeMethod, setExcludeMethodInput] = useState('');
  const [suggestedWordsIncludeMethod, setSuggestedIncludeMethodWords] = useState([]);
  const [suggestedWordsExcludeMethod, setSuggestedExcludeMethodWords] = useState([]);
  const [includedMethodsList, setIncludedMethodsList] = useState([]);
  const [excludedMethodsList, setExcludedMethodsList] = useState([]);

  // Creation State
  const [inputCreationIncludeIngredient, setCreationIncludeIngredientInput] = useState('');
  const [includedCreationIngredientsList, setCreationIncludedIngredientsList] = useState([]);
  const [inputCreationIncludeMethod, setCreationIncludeMethodInput] = useState('');
  const [includedCreationMethodsList, setCreationIncludedMethodsList] = useState([]);

  // UI State
  const [searchVisible, setSearchVisible] = useState(true);
  const [creationVisible, setCreationVisible] = useState(false);
  const [foundDishes, setFoundDishes] = useState([]);
  const [resultsReturned, setResultsReturned] = useState(false);
  const [hasHat, setHasHat] = useState('any');
  const [shibaHappy, setShibaHappy] = useState('any');

  // Buttons for NavBar — ДОБАВЛЕНА КНОПКА ВХОДА/ВЫХОДА
  const buttons = [
    {
      title: 'Поиск',
      onClick: () => {
        setSearchVisible(true);
        setCreationVisible(false);
      },
    },
    ...(currentUser?.roles?.includes('ROLE_ADMIN') // Обрати внимание: ROLE_ADMIN
      ? [
          {
            title: 'Создать',
            onClick: () => {
              setCreationVisible(true);
              setSearchVisible(false);
            },
          },
        ]
      : []),
    {
      title: currentUser ? 'Выйти' : 'Войти',
      onClick: currentUser ? handleLogout : () => setIsLoginModalOpen(true),
    },
  ];

  // === Handlers for Search Section ===

  const handleInputIncludeIngredients = (e) => {
    const value = e.target.value;
    setIncludeIngredientInput(value);
    setSuggestedIncludeIngredientsWords(getSuggestions(ingredients, value));
  };

  const handleAddIncludedIngredients = (word) => {
    if (!includedIngredientsList.includes(word)) {
      setIncludedIngredientsList([...includedIngredientsList, word]);
    }
    setIncludeIngredientInput('');
    setSuggestedIncludeIngredientsWords([]);
  };

  const handleRemoveIncludedIngredient = (ingredientToRemove) => {
    setIncludedIngredientsList((prevList) =>
      prevList.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  };

  const handleInputExcludeIngredients = (e) => {
    const value = e.target.value;
    setExcludeIngredientInput(value);
    setSuggestedExcludeIngredientsWords(getSuggestions(ingredients, value));
  };

  const handleAddExcludedIngredients = (word) => {
    if (!excludedIngredientsList.includes(word)) {
      setExcludedIngredientsList([...excludedIngredientsList, word]);
    }
    setExcludeIngredientInput('');
    setSuggestedExcludeIngredientsWords([]);
  };

  const handleRemoveExcludedIngredient = (ingredientToRemove) => {
    setExcludedIngredientsList((prevList) =>
      prevList.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  };

  const handleInputIncludeMethods = (e) => {
    const value = e.target.value;
    setIncludeMethodInput(value);
    setSuggestedIncludeMethodWords(getSuggestions(cookingMethods, value));
  };

  const handleAddIncludedMethod = (word) => {
    if (!includedMethodsList.includes(word)) {
      setIncludedMethodsList([...includedMethodsList, word]);
    }
    setIncludeMethodInput('');
    setSuggestedIncludeMethodWords([]);
  };

  const handleRemoveIncludedMethod = (ingredientToRemove) => {
    setIncludedMethodsList((prevList) =>
      prevList.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  };

  const handleInputExcludedMethods = (e) => {
    const value = e.target.value;
    setExcludeMethodInput(value);
    setSuggestedExcludeMethodWords(getSuggestions(cookingMethods, value));
  };

  const handleAddExcludedMethod = (word) => {
    if (!excludedMethodsList.includes(word)) {
      setExcludedMethodsList([...excludedMethodsList, word]);
    }
    setExcludeMethodInput('');
    setSuggestedExcludeMethodWords([]);
  };

  const handleRemoveExcludedMethod = (ingredientToRemove) => {
    setExcludedMethodsList((prevList) =>
      prevList.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  };

  // === Handlers for Creation Section ===

  const handleCreationInputIncludeIngredients = (e) => {
    const value = e.target.value;
    setCreationIncludeIngredientInput(value);
    setSuggestedIncludeIngredientsWords(getSuggestions(ingredients, value));
  };

  const handleCreationAddIncludedIngredients = (word) => {
    if (!includedCreationIngredientsList.includes(word)) {
      setCreationIncludedIngredientsList([...includedCreationIngredientsList, word]);
    }
    setCreationIncludeIngredientInput('');
    setSuggestedIncludeIngredientsWords([]);
  };

  const handleCreationRemoveIncludedIngredient = (ingredientToRemove) => {
    setCreationIncludedIngredientsList((prevList) =>
      prevList.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  };

  const handleCreationInputIncludeMethods = (e) => {
    const value = e.target.value;
    setCreationIncludeMethodInput(value);
    setSuggestedIncludeMethodWords(getSuggestions(cookingMethods, value));
  };

  const handleCreationAddIncludedMethod = (word) => {
    if (!includedCreationMethodsList.includes(word)) {
      setCreationIncludedMethodsList([...includedCreationMethodsList, word]);
    }
    setCreationIncludeMethodInput('');
    setSuggestedIncludeMethodWords([]);
  };

  const handleCreationRemoveIncludedMethod = (ingredientToRemove) => {
    setCreationIncludedMethodsList((prevList) =>
      prevList.filter((ingredient) => ingredient !== ingredientToRemove)
    );
  };

  const makeHandleKeyDown = (inputValue, setInputValue, setSuggestions, currentList, setList) => (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const value = inputValue.trim();
    if (value && !currentList.includes(value)) {
      setList([...currentList, value]);
    }
    setInputValue('');
    setSuggestions([]);
  }
};

  // === Submit Handlers ===

  const onFinish = (values) => {
    setResultsReturned(false);
    const incoming_request = {
      ingredients: {
        include: includedIngredientsList || [],
        exclude: excludedIngredientsList || [],
      },
      cook_process: {
        include: includedMethodsList || [],
        exclude: excludedMethodsList || [],
      },
      food_type: {
        include: [] || [],
        exclude: [] || [],
      },
      time: {
        lt: values.time_lt || null,
        gt: values.time_gt || null,
      },
      preparation_needed: values.preparation === 'yes' ? true : values.preparation === 'no' ? false : null,
      is_expensive: values.canBeExpensive === 'yes' ? true : values.canBeExpensive === 'no' ? false : null,
      dish_name: values.dishName || null,
      has_meat: values.hasMeat === 'yes' ? true : values.hasMeat === 'no' ? false : null,
      instruction: null,
    };

    const jsonValues = JSON.stringify(incoming_request, null, 2);
    console.log(jsonValues);

    fetch('http://localhost:8070/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentUser?.token && { Authorization: `Bearer ${currentUser.token}` }),
      },
      body: jsonValues,
    })
      .then((response) => {
        setResultsReturned(true);
        if (response.ok) {
          return response.json();
        } else {
          setFoundDishes([]);
          throw new Error(`Error: ${response.status}`);
        }
      })
      .then((data) => {
        setFoundDishes(data);
        console.log('Success:', data);
        message.success('Form submitted successfully!');
      })
      .catch((error) => {
        console.error('Error:', error);
        message.error('There was an issue submitting your form. Please try again.');
      });
  };

  const onCreationFinish = (values) => {
    const incoming_request = {
      ingredients: includedCreationIngredientsList || [],
      cook_process: includedCreationMethodsList || [],
      food_type: null,
      time: values.time,
      url: values.url,
      preparation_needed: values.preparation === 'yes' ? true : values.preparation === 'no' ? false : null,
      is_expensive: values.canBeExpensive === 'yes' ? true : values.canBeExpensive === 'no' ? false : null,
      dish_name: values.dishName || null,
      has_meat: values.hasMeat === 'yes' ? true : values.hasMeat === 'no' ? false : null,
      instruction: null,
    };

    const jsonValues = JSON.stringify(incoming_request, null, 2);
    console.log(jsonValues);

    fetch('http://localhost:8070/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentUser?.token && { Authorization: `Bearer ${currentUser.token}` }),
      },
      body: jsonValues,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      })
      .then((data) => {
        console.log('Success:', data);
        message.success('Form submitted successfully!');
      })
      .catch((error) => {
        console.error('Error:', error);
        message.error('There was an issue submitting your form. Please try again.');
      });
  };

  const onFinishFailed = () => {
    message.warning('Please fill in the details');
  };

  const onCreationFinishFailed = () => {
    message.warning('Please fill in the details');
  };

  // === Render ===

  return (
    <div className="overall">
      <div>
        <NavBar sections={buttons} />
      </div>

      {/* Модалка входа */}
      <Modal
        title="Вход"
        open={isLoginModalOpen}
        onCancel={() => setIsLoginModalOpen(false)}
        footer={null}
      >
        <Form form={loginForm} onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Введите имя пользователя!' }]}
          >
            <Input placeholder="Имя пользователя" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Войти
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => {
              setIsLoginModalOpen(false);
              setIsRegisterModalOpen(true);
            }}>
              Регистрация
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Модалка регистрации */}
      <Modal
        title="Регистрация"
        open={isRegisterModalOpen}
        onCancel={() => setIsRegisterModalOpen(false)}
        footer={null}
      >
        <Form form={registerForm} onFinish={handleRegister}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Введите имя пользователя!' }]}
          >
            <Input placeholder="Имя пользователя" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Зарегистрироваться
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => {
              setIsRegisterModalOpen(false);
              setIsLoginModalOpen(true);
            }}>
              Уже есть аккаунт? Войти
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Search View */}
      {searchVisible && (
        <div>
          <div className="dog-head shiba color-b">
            {hasHat === 'yes' && <div className="hat hat-top"></div>}
            <div className="dog-ears"></div>
            <div className="dog-eyes"></div>
            <div className={shibaHappy === 'no' ? 'dog-snout-sad' : 'dog-snout'}></div>
          </div>

          <div style={{ display: 'block', padding: 30, width: 690 }}>
            <h3>Включить инггредиенты:</h3>
            <InputWithSuggestions
              inputValue={inputIncludeIngredient}
              suggestions={suggestedWordsIncludeIngredient}
              onInputChange={handleInputIncludeIngredients}
              onAddItem={handleAddIncludedIngredients}
              onKeyDown={makeHandleKeyDown(
    inputIncludeIngredient,
    setIncludeIngredientInput,
    setSuggestedIncludeIngredientsWords,
    includedIngredientsList,
    setIncludedIngredientsList
  )}
              placeholder="Type to search..."
            />
            <TagList items={includedIngredientsList} onRemove={handleRemoveIncludedIngredient} bgColor="#d9f7be" />

            <h3 style={{ marginTop: '20px' }}>Исключить инггредиенты:</h3>
            <InputWithSuggestions
              inputValue={inputExcludeIngredient}
              suggestions={suggestedWordsExcludeIngredient}
              onInputChange={handleInputExcludeIngredients}
              onAddItem={handleAddExcludedIngredients}
              onKeyDown={makeHandleKeyDown(
    inputExcludeIngredient,
    setExcludeIngredientInput,
    setSuggestedExcludeIngredientsWords,
    excludedIngredientsList,
    setExcludedIngredientsList
  )}
              placeholder="Type to search..."
            />
            <TagList items={excludedIngredientsList} onRemove={handleRemoveExcludedIngredient} bgColor="#ea3b52" textColor="white" />

            <h3 style={{ marginTop: '20px' }}>Включить способы приготовления:</h3>
            <InputWithSuggestions
              inputValue={inputIncludeMethod}
              suggestions={suggestedWordsIncludeMethod}
              onInputChange={handleInputIncludeMethods}
              onAddItem={handleAddIncludedMethod}
              onKeyDown={makeHandleKeyDown(
    inputIncludeMethod,
    setIncludeMethodInput,
    setSuggestedIncludeMethodWords,
    includedMethodsList,
    setIncludedMethodsList
  )}
              placeholder="Type to search..."
            />
            <TagList items={includedMethodsList} onRemove={handleRemoveIncludedMethod} bgColor="#d9f7be" />

            <h3 style={{ marginTop: '20px' }}>Исключить способы приготовления:</h3>
            <InputWithSuggestions
              inputValue={inputExcludeMethod}
              suggestions={suggestedWordsExcludeMethod}
              onInputChange={handleInputExcludedMethods}
              onAddItem={handleAddExcludedMethod}
              onKeyDown={makeHandleKeyDown(
    inputExcludeMethod,
    setExcludeMethodInput,
    setSuggestedExcludeMethodWords,
    excludedMethodsList,
    setExcludedMethodsList
  )}
              placeholder="Type to search..."
            />
            <TagList items={excludedMethodsList} onRemove={handleRemoveExcludedMethod} bgColor="#ea3b52" textColor="white" />

            <Form
              name="form"
              initialValues={{ canBeExpensive: 'any', hasMeat: 'any', preparation: 'any' }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              style={{ marginTop: '20px' }}
            >
              <h3 style={{ marginTop: '20px' }}>Время готовки:</h3>

              <Form.Item label="От:" name="time_gt" rules={[{ required: false, message: 'Минимальное время готовки' }]}>
                <Input />
              </Form.Item>

              <Form.Item label="До:" name="time_lt" rules={[{ required: false, message: 'Максимальное время готовки' }]}>
                <Input />
              </Form.Item>

              <Form.Item label="Название блюда:" name="dishName" rules={[{ required: false, message: 'Название блюда' }]}>
                <Input />
              </Form.Item>

              <Form.Item label="Мясо в блюде" name="hasMeat">
                <Radio.Group onChange={(e) => setShibaHappy(e.target.value)}>
                  <Radio value="yes">Обязательно</Radio>
                  <Radio value="any">Неважно</Radio>
                  <Radio value="no">Исключить</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Стоимость ингредиентов" name="canBeExpensive">
                <Radio.Group onChange={(e) => setHasHat(e.target.value)}>
                  <Radio value="yes">Только с дорогими ингредиентами</Radio>
                  <Radio value="any">Неважно</Radio>
                  <Radio value="no">Исключить дорогие блюда</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Готовка включает подготовку ингредиентов" name="preparation">
                <Radio.Group>
                  <Radio value="yes">Обязательно</Radio>
                  <Radio value="any">Неважно</Radio>
                  <Radio value="no">Не включает</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>

            {resultsReturned && (
              <div>
                {foundDishes.map((dish, index) => (
                  <Card key={index} name={dish.name} url={dish.url} ingredients={dish.ingredients || []} />
                ))}
                <div
                  style={{
                    padding: '16px',
                    maxWidth: '400px',
                    margin: '16px auto',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    onClick={() => {
                      if (foundDishes.length > 0) {
                        const randomIndex = Math.floor(Math.random() * foundDishes.length);
                        const selectedName = foundDishes[randomIndex].name;
                        alert('Выбрано: ' + selectedName);
                      }
                    }}
                    style={{ margin: '16px 0', padding: '8px 16px', cursor: 'pointer' }}
                  >
                    Выбрать случайное
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Creation View */}
      {creationVisible && currentUser?.roles?.includes('ROLE_ADMIN') && (
        <div style={{ padding: 30, width: 690 }}>
          <h3>Включить инггредиенты:</h3>
          <InputWithSuggestions
            inputValue={inputCreationIncludeIngredient}
            suggestions={suggestedWordsIncludeIngredient}
            onInputChange={handleCreationInputIncludeIngredients}
            onAddItem={handleCreationAddIncludedIngredients}
            onKeyDown={makeHandleKeyDown(
    inputCreationIncludeIngredient,
    setCreationIncludeIngredientInput,
    setSuggestedIncludeIngredientsWords,
    includedCreationIngredientsList,
    setCreationIncludedIngredientsList
  )}
            placeholder="Type to search..."
          />
          <TagList items={includedCreationIngredientsList} onRemove={handleCreationRemoveIncludedIngredient} bgColor="#d9f7be" />

          <h3 style={{ marginTop: '20px' }}>Включить способы приготовления:</h3>
          <InputWithSuggestions
            inputValue={inputCreationIncludeMethod}
            suggestions={suggestedWordsIncludeMethod}
            onInputChange={handleCreationInputIncludeMethods}
            onAddItem={handleCreationAddIncludedMethod}
            onKeyDown={makeHandleKeyDown(
    inputCreationIncludeMethod,
    setCreationIncludeMethodInput,
    setSuggestedIncludeMethodWords,
    includedCreationMethodsList,
    setCreationIncludedMethodsList
  )}
            placeholder="Type to search..."
          />
          <TagList items={includedCreationMethodsList} onRemove={handleCreationRemoveIncludedMethod} bgColor="#d9f7be" />

          <Form
            name="form"
            initialValues={{ canBeExpensive: 'no', hasMeat: 'no', preparation: 'no' }}
            onFinish={onCreationFinish}
            onFinishFailed={onCreationFinishFailed}
            style={{ marginTop: '20px' }}
          >
            <h3 style={{ marginTop: '20px' }}>Время готовки:</h3>

            <Form.Item label="Время готовки:" name="time" rules={[{ required: false, message: 'Время готовки' }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Название блюда:" name="dishName" rules={[{ required: false, message: 'Название блюда' }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Ссылка:" name="url" rules={[{ required: false, message: 'url' }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Мясо в блюде" name="hasMeat">
              <Radio.Group>
                <Radio value="yes">Мясное блюдо</Radio>
                <Radio value="no">Блюдо без мяса</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Стоимость ингредиентов" name="canBeExpensive">
              <Radio.Group>
                <Radio value="yes">Блюдо включает дорогие ингредиенты</Radio>
                <Radio value="no">Блюдо не включает дорогие ингредиенты</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Готовка включает подготовку ингредиентов" name="preparation">
              <Radio.Group>
                <Radio value="yes">Подготовка требуется</Radio>
                <Radio value="no">Подготовка не требуется</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
}