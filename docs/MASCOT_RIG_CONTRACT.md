# Contrato de mascota 1.0

`NexoMascotController.plan` decide intención a partir de mascota, equipo, habitación, actividad y evento académico. La decisión no altera inventario ni concede recompensas.

Ranuras actuales: `head`, `face`, `shirt`, `back`, `tail`, `aura`, `background`. El contrato reserva `main_hand` y `off_hand` para objetos futuros sin crear artículos ficticios en la tienda.

Los artboards Rive disponibles son `pig`, `cat` y `dog`, con la máquina `Idle`. No hay anclas ni animaciones de lectura, combate o baile verificadas en el archivo actual. Por eso, cuando hay cosméticos equipados, se usa la composición del cuerpo y accesorios en un solo canvas. Evita que una capa estática se desplace respecto a una mascota animada. Una animación contextual real requiere un rig nuevo con anclas probadas para todas las especies; no se simula mediante capas sueltas.

El contrato se prueba en las tres especies, nueve ranuras y siete habitaciones. Las intenciones `read`, `ready`, `sleep`, `think` y otras están listas para conectarse a un rig posterior, pero la UI no debe presentarlas como animaciones ya disponibles.
