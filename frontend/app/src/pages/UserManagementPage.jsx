import { useEffect, useState } from "react";
import { getUsers, updateUserRole, getAvailableRoles } from "../api/admin.api";
import toast from "react-hot-toast";

const Header = ({ column, onSort, sortOrder, sortColumn }) => {
  const isActive = column === sortColumn;
  return (
    <th
      className={`px-4 py-2 cursor-pointer ${
        isActive ? "text-secondary-500 font-bold" : "text-gray-700"
      }`}
      onClick={() => onSort(column)}
    >
      {column}
      {isActive && (
        <span className="ml-2">{sortOrder === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [sortColumn, setSortColumn] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Error al cargar usuarios");
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await getAvailableRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error al cargar roles:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRoles()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSort = (column) => {
    setSortColumn((prevSortColumn) => {
      const newSortOrder =
        prevSortColumn !== column
          ? "asc"
          : sortOrder === "asc"
          ? "desc"
          : "asc";
      setSortOrder(newSortOrder);
      return column;
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("Rol actualizado correctamente");
      fetchUsers(); // Recargar usuarios
    } catch (error) {
      toast.error("Error al actualizar rol");
      console.error("Error:", error);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
      <div className="mb-4 text-sm text-gray-600">
        Total de usuarios: {users.length}
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            {[
              { key: "first_name", label: "Nombre" },
              { key: "email", label: "Email" },
              { key: "role", label: "Rol" },
              { key: "is_active", label: "Estado" },
              { key: "date_joined", label: "Fecha de registro" },
              { key: "actions", label: "Acciones" },
            ].map(({ key, label }) => (
              <Header
                key={key}
                column={key}
                onSort={handleSort}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id} className="even:bg-gray-100 odd:bg-white">
              <td className="px-4 py-2 border border-gray-300">
                {user.first_name} {user.last_name}
              </td>
              <td className="px-4 py-2 border border-gray-300">{user.email}</td>
              <td className="px-4 py-2 border border-gray-300">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "vendedor"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {roles[user.role] || user.role}
                </span>
              </td>
              <td className="px-4 py-2 border border-gray-300">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-2 border border-gray-300">
                {new Date(user.date_joined).toLocaleDateString("es-ES")}
              </td>
              <td className="px-4 py-2 border border-gray-300">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                  disabled={user.is_superuser} // No permitir cambiar rol de superusuarios
                >
                  {Object.entries(roles).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
                {user.is_superuser && (
                  <span className="text-xs text-gray-500 ml-1">
                    (Superusuario)
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;
