import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import CategoryForm from "../components/formComponents/CategoryForm";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories.api";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/Card";

const CategoriesManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Cargar categorías
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        const updatedCategory = await updateCategory(
          editingCategory.id,
          categoryData
        );
        setCategories(
          categories.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          )
        );
      } else {
        const newCategory = await createCategory(categoryData);
        setCategories([...categories, newCategory]);
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      throw error; // Re-lanzar para que el formulario maneje el error
    }
  };

  const handleDeleteCategory = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter((cat) => cat.id !== id));
      } catch (error) {
        console.error("Error al eliminar categoría:", error);
        alert(
          "Error al eliminar la categoría. Puede que tenga productos asociados."
        );
      }
    }
  };

  const toggleExpanded = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getChildCategories = (parentId) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  const renderCategoryTree = (parentId = null, level = 0) => {
    const childCategories = getChildCategories(parentId);

    return childCategories.map((category) => {
      const hasChildren = getChildCategories(category.id).length > 0;
      const isExpanded = expandedCategories.has(category.id);

      return (
        <div key={category.id} className="border-l-2 border-gray-200 ml-4">
          <div
            className={`flex items-center justify-between p-3 hover:bg-gray-50 ${
              level > 0 ? "ml-4" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen size={20} className="text-blue-500" />
                ) : (
                  <Folder size={20} className="text-blue-500" />
                )
              ) : (
                <Folder size={20} className="text-gray-400" />
              )}
              <span className="font-medium">{category.name}</span>
              <span className="text-sm text-gray-500">
                (Orden: {category.display_order})
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCategory(category);
                  setShowCategoryForm(true);
                }}
                className="text-blue-500 hover:text-blue-700 p-1 rounded"
                title="Editar"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-4">
              {renderCategoryTree(category.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600 mt-2">
            Administra las categorías de productos de tu tienda
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="primary"
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryForm(true);
            }}
          >
            Nueva Categoría
          </Button>
          <Button variant="outline" onClick={() => setShowCategoryForm(false)}>
            Cancelar
          </Button>
        </div>
      </div>

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          categories={categories}
          onSave={handleSaveCategory}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Estructura de Categorías
        </h2>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Folder size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay categorías creadas</p>
            <p className="text-sm">Comienza creando tu primera categoría</p>
          </div>
        ) : (
          <div className="space-y-2">{renderCategoryTree()}</div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard
          title="Total de Categorías"
          value={categories.length}
          icon={<Folder size={24} className="text-blue-500" />}
        />

        <StatCard
          title="Categorías Principales"
          value={categories.filter((cat) => !cat.parent_id).length}
          icon={<FolderOpen size={24} className="text-green-500" />}
        />

        <StatCard
          title="Subcategorías"
          value={categories.filter((cat) => cat.parent_id).length}
          icon={<Folder size={24} className="text-purple-500" />}
        />
      </div>
    </div>
  );
};

export default CategoriesManagementPage;
