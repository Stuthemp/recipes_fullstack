package stuthemp.recipes.recipes_app.dto.request.creation;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.Set;

@Data
public class DishCreationDto {

    @JsonProperty("dish_name")
    private String name;
    private String url;
    private String instruction;
    private Integer time;
    @JsonProperty("preparation_needed")
    private Boolean preparationNeeded;
    @JsonProperty("is_expensive")
    private Boolean isExpensive;
    @JsonProperty("has_meat")
    private Boolean hasMeat;
    @JsonProperty("food_type")
    private String foodType;
    private Set<String> ingredients;
    @JsonProperty("cook_process")
    private Set<String> cookProcess;

}
