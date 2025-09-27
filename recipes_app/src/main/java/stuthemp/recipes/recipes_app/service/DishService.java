package stuthemp.recipes.recipes_app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stuthemp.recipes.recipes_app.dto.request.search.DishSearchDto;
import stuthemp.recipes.recipes_app.model.CookProcess;
import stuthemp.recipes.recipes_app.model.Dish;
import stuthemp.recipes.recipes_app.model.Ingredient;
import stuthemp.recipes.recipes_app.repository.CookProcessRepository;
import stuthemp.recipes.recipes_app.repository.DishRepository;
import stuthemp.recipes.recipes_app.repository.IngredientRepository;
import stuthemp.recipes.recipes_app.dto.request.creation.DishCreationDto;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Slf4j
public class DishService {

    @Autowired
    DishRepository dishRepository;
    @Autowired
    IngredientRepository ingredientRepository;
    @Autowired
    CookProcessRepository cookProcessRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public boolean create(DishCreationDto dishCreationDto) {
        try {
            Dish dish = new Dish();
            Set<CookProcess> cookProcessExists = cookProcessRepository.findByNameIn(dishCreationDto.getCookProcess());
            Set<Ingredient> ingredientsExists = ingredientRepository.findByNameIn(dishCreationDto.getIngredients());

            Set<String> missingIngredients = findMissingIngredientNames(ingredientsExists, dishCreationDto.getIngredients());
            Set<String> missingCookProcess = findMissingCookProcessNames(cookProcessExists, dishCreationDto.getCookProcess());

            dish.setCookProcess(cookProcessExists);
            for (String cookProcessName: missingCookProcess) {
                CookProcess cookProcess = new CookProcess();
                cookProcess.setName(cookProcessName);
                dish.getCookProcess().add(cookProcess);

                cookProcessRepository.save(cookProcess);
            }

            dish.setIngredients(ingredientsExists);
            for (String ingredientName: missingIngredients) {
                Ingredient ingredient = new Ingredient();
                ingredient.setName(ingredientName);
                dish.getIngredients().add(ingredient);

                ingredientRepository.save(ingredient);
            }

            dish.setName(dishCreationDto.getName());
            dish.setFoodType(dishCreationDto.getFoodType());
            dish.setTime(dishCreationDto.getTime());
            dish.setUrl(dishCreationDto.getUrl());
            dish.setHasMeat(dishCreationDto.getHasMeat());
            dish.setIsExpensive(dishCreationDto.getIsExpensive());
            dish.setPreparationNeeded(dishCreationDto.getPreparationNeeded());

            dishRepository.save(dish);
            return true;
        } catch (Exception e) {
            log.error("Error while creating dish: " + e.getClass() + " with message " + e.getMessage());
            return false;
        }
    }

    @Transactional
    public Iterable<Dish> findAll(DishSearchDto dishSearchDto) {
        try {
            StringBuilder sb = new StringBuilder("SELECT * FROM dishes d ");
            sb.append("JOIN dish_ingredients di ON d.id = di.dish_id ");
            sb.append("JOIN ingredients i ON di.ingredient_id = i.id ");
            sb.append("JOIN dish_cook_process dcp ON d.id = dcp.dish_id ");
            sb.append("JOIN cook_processes cp ON dcp.cook_process_id = cp.id ");
            sb.append("WHERE 1=1 ");

            if (dishSearchDto.getHasMeat() != null) {
                if (dishSearchDto.getHasMeat()) {
                    sb.append("AND d.has_meat IS TRUE ");
                } else {
                    sb.append("AND d.has_meat IS FALSE ");
                }
            }

            if (dishSearchDto.getIsExpensive() != null) {
                if (dishSearchDto.getHasMeat()) {
                    sb.append("AND d.is_expensive IS TRUE ");
                } else {
                    sb.append("AND d.is_expensive IS FALSE ");
                }
            }

            if (dishSearchDto.getPreparationNeeded() != null) {
                if (dishSearchDto.getHasMeat()) {
                    sb.append("AND d.preparation_needed IS TRUE ");
                } else {
                    sb.append("AND d.preparation_needed IS FALSE ");
                }
            }

            if(dishSearchDto.getTime() != null) {
                if(dishSearchDto.getTime().getGt() != null) {
                    sb.append("AND d.time > ").append(dishSearchDto.getTime().getGt()).append(" ");
                }
                if(dishSearchDto.getTime().getLt() != null) {
                    sb.append("AND d.time < ").append(dishSearchDto.getTime().getLt()).append(" ");
                }
            }

            if(dishSearchDto.getName() != null) {
                sb.append("AND d.name LIKE '%").append(dishSearchDto.getName()).append("%' ");
            }

            if(dishSearchDto.getInstruction() != null) {
                sb.append("AND d.instruction LIKE '%").append(dishSearchDto.getInstruction()).append("%' ");
            }

            if(dishSearchDto.getFoodType() != null) {
                if(dishSearchDto.getFoodType().getInclude() != null && !dishSearchDto.getFoodType().getInclude().isEmpty()) {
                    sb.append("AND d.food_type IN (");
                    for (int j = 0; j < dishSearchDto.getFoodType().getInclude().size(); j++) {
                        sb.append("'").append(dishSearchDto.getFoodType().getInclude().get(j)).append("'");
                        if (j < dishSearchDto.getFoodType().getInclude().size() - 1) {
                            sb.append(", ");
                        }
                    }
                    sb.append(") ");
                }
                if(dishSearchDto.getFoodType().getExclude() != null && !dishSearchDto.getFoodType().getExclude().isEmpty()) {
                    sb.append("AND d.food_type NOT IN (");
                    for (int j = 0; j < dishSearchDto.getFoodType().getExclude().size(); j++) {
                        sb.append("'").append(dishSearchDto.getFoodType().getExclude().get(j)).append("'");
                        if (j < dishSearchDto.getFoodType().getExclude().size() - 1) {
                            sb.append(", ");
                        }
                    }
                    sb.append(") ");
                }
            }


            if(dishSearchDto.getIngredients() != null) {
                if (!dishSearchDto.getIngredients().getInclude().isEmpty()) {
                    sb.append("AND i.name IN (");
                    for (int j = 0; j < dishSearchDto.getIngredients().getInclude().size(); j++) {
                        sb.append("'").append(dishSearchDto.getIngredients().getInclude().get(j)).append("'");
                        if (j < dishSearchDto.getIngredients().getInclude().size() - 1) {
                            sb.append(", ");
                        }
                    }
                    sb.append(") ");
                }

                if (!dishSearchDto.getIngredients().getExclude().isEmpty()) {
                    sb.append("AND i.name NOT IN (");
                    for (int j = 0; j < dishSearchDto.getIngredients().getExclude().size(); j++) {
                        sb.append("'").append(dishSearchDto.getIngredients().getExclude().get(j)).append("'");
                        if (j < dishSearchDto.getIngredients().getExclude().size() - 1) {
                            sb.append(", ");
                        }
                    }
                    sb.append(") ");
                }
            }

            if(dishSearchDto.getCookProcess() != null) {
                if (!dishSearchDto.getCookProcess().getInclude().isEmpty()) {
                    sb.append("AND cp.name IN (");
                    for (int j = 0; j < dishSearchDto.getCookProcess().getInclude().size(); j++) {
                        sb.append("'").append(dishSearchDto.getCookProcess().getInclude().get(j)).append("'");
                        if (j < dishSearchDto.getCookProcess().getInclude().size() - 1) {
                            sb.append(", ");
                        }
                    }
                    sb.append(") ");
                }

                if (!dishSearchDto.getCookProcess().getExclude().isEmpty()) {
                    sb.append("AND cp.name NOT IN (");
                    for (int j = 0; j < dishSearchDto.getCookProcess().getExclude().size(); j++) {
                        sb.append("'").append(dishSearchDto.getCookProcess().getExclude().get(j)).append("'");
                        if (j < dishSearchDto.getCookProcess().getExclude().size() - 1) {
                            sb.append(", ");
                        }
                    }
                    sb.append(") ");
                }
            }

            List<Dish> dishes = findAllDishes((sb.toString()));
            List<Long> ids = dishes.stream().map(Dish::getId).toList();

            return dishRepository.findAllById(ids);
        } catch (Exception e) {
            log.error("Error while looking for dish: " + e.getClass() + " with message " + e.getMessage());
            return List.of();
        }
    }

    private List<Dish> findAllDishes(String sql) {
        return jdbcTemplate.query(sql, new RowMapper<Dish>() {
            @Override
            public Dish mapRow(ResultSet rs, int rowNum) throws SQLException {
                Dish dish = new Dish();
                dish.setId(rs.getLong("id"));
                dish.setName(rs.getString("name"));
                dish.setUrl(rs.getString("url"));
                dish.setInstruction(rs.getString("instruction"));
                dish.setTime(rs.getInt("time"));
                dish.setPreparationNeeded(rs.getBoolean("preparation_needed"));
                dish.setIsExpensive(rs.getBoolean("is_expensive"));
                dish.setHasMeat(rs.getBoolean("has_meat"));
                dish.setFoodType(rs.getString("food_type"));
                return dish;
            }
        });
    }

    public static Set<String> findMissingIngredientNames(Set<Ingredient> ingredients, Set<String> names) {
        // Create a set of ingredient names
        Set<String> ingredientNames = ingredients.stream()
                .map(Ingredient::getName)
                .collect(Collectors.toSet());

        // Find names in the names set that are not in ingredientNames
        return names.stream()
                .filter(name -> !ingredientNames.contains(name))
                .collect(Collectors.toSet());
    }

    public static Set<String> findMissingCookProcessNames(Set<CookProcess> ingredients, Set<String> names) {
        // Create a set of ingredient names
        Set<String> ingredientNames = ingredients.stream()
                .map(CookProcess::getName)
                .collect(Collectors.toSet());

        // Find names in the names set that are not in ingredientNames
        return names.stream()
                .filter(name -> !ingredientNames.contains(name))
                .collect(Collectors.toSet());
    }

    @Transactional
    public List<String> findAllIngredients() {
        return StreamSupport.stream(ingredientRepository.findAll().spliterator(), false)
                .map(Ingredient::getName)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<String> findAllCookProcesses() {
        return StreamSupport.stream(cookProcessRepository.findAll().spliterator(), false)
                .map(CookProcess::getName)
                .collect(Collectors.toList());
    }

}
