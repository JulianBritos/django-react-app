import { useEffect, useState } from "react";
import { getUsers, updateUserRole } from "../api/admin.api";
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
  const [sortColumn, setSortColumn] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    fetchUsers();
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
      toast.success("Rol actualizado");
      fetchUsers();
    } catch (error) {
      toast.error("Error al actualizar rol");
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            {[
              { key: "first_name", label: "Nombre" },
              { key: "email", label: "Email" },
              { key: "role", label: "Rol" },
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
              <td className="px-4 py-2 border border-gray-300">{user.role}</td>
              <td className="px-4 py-2 border border-gray-300">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Admin">Administrador</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;
