import { useForm } from "react-hook-form";
import { createTask, deleteTask } from "../api/tasks.api";
import { useNavigate, useParams } from "react-router-dom";

export function TaskFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate(); // Si piensas usar navigate después de la creación
  const params = useParams();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createTask(data);

      // Si necesitas redirigir después de la creación exitosa
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  });

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="title"
          {...register("title", { required: true })}
        />
        {errors.title && <span>Title is required</span>}

        <textarea
          rows="3"
          placeholder="description"
          {...register("description", { required: true })}
        />
        {errors.description && <span>Description is required</span>}

        <button>Save</button>
      </form>

      {params.id && (
        <button
          onClick={async () => {
            const accepted = window.confirm("are you sure?");
            if (accepted) {
              await deleteTask(params.id);
              navigate("/tasks/");
            }
          }}
        >
          Delete
        </button>
      )}
    </div>
  );
}
