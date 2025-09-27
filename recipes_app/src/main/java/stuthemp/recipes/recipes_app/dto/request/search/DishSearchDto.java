package stuthemp.recipes.recipes_app.dto.request.search;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DishSearchDto {
    private IngredientsDto ingredients;
    @JsonProperty("cook_process")
    private CookProcessDto cookProcess;
    @JsonProperty("food_type")
    private FoodTypeDto foodType;
    private TimeConstraints time;
    @JsonProperty("preparation_needed")
    private Boolean preparationNeeded;
    @JsonProperty("is_expensive")
    private Boolean isExpensive;
    @JsonProperty("dish_name")
    private String name;
    @JsonProperty("has_meat")
    private Boolean hasMeat;
    private String instruction;
}
