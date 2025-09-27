package stuthemp.recipes.recipes_app.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.Set;

@Data
@Entity
@Table(name = "dishes")
@EntityListeners(AuditingEntityListener.class)
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String url;

    @Column(nullable = true)
    private String instruction;

    @Column(nullable = false)
    private Integer time;

    @Column(name = "preparation_needed", nullable = true)
    private Boolean preparationNeeded;

    @Column(name = "is_expensive", nullable = true)
    private Boolean isExpensive;

    @Column(name = "has_meat", nullable = true)
    private Boolean hasMeat;

    @Column(name = "food_type", nullable = true)
    private String foodType;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "dish_ingredients",
            joinColumns = @JoinColumn(name = "dish_id"),
            inverseJoinColumns = @JoinColumn(name = "ingredient_id"))
    private Set<Ingredient> ingredients;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "dish_cook_process",
            joinColumns = @JoinColumn(name = "dish_id"),
            inverseJoinColumns = @JoinColumn(name = "cook_process_id"))
    private Set<CookProcess> cookProcess;
}
