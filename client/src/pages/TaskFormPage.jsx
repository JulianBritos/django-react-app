import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createTask, deleteTask, updateTask, getTask } from "../api/tasks.api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

export function TaskFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate(); // Si piensas usar navigate después de la creación
  const params = useParams();

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await updateTask(params.id, data);
      toast.success("Tarea Actualizada", {
        position: "bottom-right",
        style: {
          background: "#101010",
          color: "#fff",
        },
      });
    } else {
      await createTask(data);
      toast.success("Tarea creada", {
        position: "bottom-right",
        style: {
          background: "#101010",
          color: "#fff",
        },
      });
    }
    navigate("/tasks");
  });
  useEffect(() => {
    async function loadTask() {
      if (params.id) {
        const {
          data: { title, description },
        } = await getTask(params.id);
        setValue("title", title);
        setValue("description", description);
      }
    }
    loadTask();
  }, []);
  return (
    <div>
      <form onSubmit={onSubmit}>
        <div class="space-y-12">
          <div class="border-b border-white-900/10 pb-12">
            <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div class="sm:col-span-4">
                <label
                  for="username"
                  class="block text-sm font-medium leading-6 text-white-900"
                >
                  Task title
                </label>
                <div class="mt-2">
                  <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-white-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-white-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      type="text"
                      placeholder="Write your task here"
                      {...register("title", { required: true })}
                    />
                    {errors.title && <span>Title is required</span>}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-span-full">
              <label
                for="about"
                class="block mt-4 text-sm font-medium leading-6 text-white-900"
              >
                Description
              </label>
              <div class="mt-2">
                <textarea
                  class="block pl-1 w-full rounded-md border-0 bg-transparent py-1.5 text-gray-100 shadow-sm ring-1 ring-inset focus-within:ring-indigo-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 "
                  rows="3"
                  placeholder="Description"
                  {...register("description", { required: true })}
                />
                {errors.description && <span>Description is required</span>}
              </div>
              <div className="grid grid-cols-4">
                <button className="mt-4 mr-10 bg-indigo-500 px-3 pl-2 rounded-lg ">
                  Save
                </button>

                {params.id && (
                  <button
                    className="mt-4 bg-red-500 px-3 pl-2 rounded-lg"
                    onClick={async () => {
                      const accepted = window.confirm("are you sure?");
                      if (accepted) {
                        await deleteTask(params.id);
                        toast.success("Tarea Eliminada", {
                          position: "bottom-right",
                        });
                        navigate("/tasks/");
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
