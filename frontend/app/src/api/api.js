// Función para obtener el token del localStorage
const getAuthToken = () => {
  // Corregir: usar "access" en lugar de "access_token"
  return localStorage.getItem("access");
};

// Función para hacer requests autenticados
const authenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return;
    }

    if (response.status === 403) {
      // Permisos insuficientes
      throw new Error("No tienes permisos para realizar esta acción");
    }

    return response;
  } catch (error) {
    console.error("Error en request:", error);
    throw error;
  }
};

// Función para requests que permiten guest users
const guestAllowedRequest = async (url, options = {}) => {
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Si hay token, incluirlo (opcional para guest checkout)
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Para guest checkout, no redirigir automáticamente
      console.warn(
        "Token inválido en guest checkout, continuando como anónimo"
      );
    }

    return response;
  } catch (error) {
    console.error("Error en guest request:", error);
    throw error;
  }
};

// Función para requests públicos (sin autenticación)
const publicRequest = async (url, options = {}) => {
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error("Error en public request:", error);
    throw error;
  }
};

// Exportar funciones de API
export const api = {
  // APIs que requieren autenticación
  get: (url) => authenticatedRequest(url),
  post: (url, data) =>
    authenticatedRequest(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (url, data) =>
    authenticatedRequest(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: (url, data) =>
    authenticatedRequest(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (url) =>
    authenticatedRequest(url, {
      method: "DELETE",
    }),

  // APIs que permiten guest users
  guest: {
    get: (url) => guestAllowedRequest(url),
    post: (url, data) =>
      guestAllowedRequest(url, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    put: (url, data) =>
      guestAllowedRequest(url, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    patch: (url, data) =>
      guestAllowedRequest(url, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (url) =>
      guestAllowedRequest(url, {
        method: "DELETE",
      }),
  },

  // APIs públicas
  public: {
    get: (url) => publicRequest(url),
    post: (url, data) =>
      publicRequest(url, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};

// Utilidades para manejo de respuestas
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.detail || `HTTP ${response.status}`
    );
  }

  return response.json();
};

// Utilidades para guest checkout
export const guestCheckout = {
  // Crear preferencia de pago (permite guest)
  createPaymentPreference: async (paymentData) => {
    const response = await api.guest.post(
      "/apps/payments/create_preference/",
      paymentData
    );
    return handleApiResponse(response);
  },

  // Obtener productos (público)
  getProducts: async () => {
    const response = await api.public.get("/apps/products/products/");
    return handleApiResponse(response);
  },

  // Obtener categorías (público)
  getCategories: async () => {
    const response = await api.public.get("/apps/products/categories/");
    return handleApiResponse(response);
  },

  // Obtener atributos (público)
  getAttributes: async () => {
    const response = await api.public.get("/apps/products/attributes/");
    return handleApiResponse(response);
  },
};

// Utilidades para usuarios autenticados
export const authenticatedApi = {
  // Gestión de usuarios (solo admins)
  getUsers: async () => {
    const response = await api.get("/api/users/");
    return handleApiResponse(response);
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    const response = await api.get("/api/users/me/");
    return handleApiResponse(response);
  },

  // Actualizar usuario
  updateUser: async (userId, userData) => {
    const response = await api.patch(`/api/users/${userId}/`, userData);
    return handleApiResponse(response);
  },

  // Actualizar rol de usuario (solo admins)
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/api/users/${userId}/update_role/`, {
      role,
    });
    return handleApiResponse(response);
  },

  // Obtener roles disponibles
  getRoles: async () => {
    const response = await api.get("/api/users/roles/");
    return handleApiResponse(response);
  },
};

// Utilidades para gestión de productos (vendedores/admins)
export const productManagement = {
  // Crear producto
  createProduct: async (productData) => {
    const response = await api.post("/apps/products/products/", productData);
    return handleApiResponse(response);
  },

  // Actualizar producto
  updateProduct: async (productId, productData) => {
    const response = await api.patch(
      `/apps/products/products/${productId}/`,
      productData
    );
    return handleApiResponse(response);
  },

  // Eliminar producto
  deleteProduct: async (productId) => {
    const response = await api.delete(`/apps/products/products/${productId}/`);
    return handleApiResponse(response);
  },

  // Gestión de variantes de productos (solo admins)
  createProductAttribute: async (attributeData) => {
    const response = await api.post(
      "/apps/products/productattributes/",
      attributeData
    );
    return handleApiResponse(response);
  },

  updateProductAttribute: async (attributeId, attributeData) => {
    const response = await api.patch(
      `/apps/products/productattributes/${attributeId}/`,
      attributeData
    );
    return handleApiResponse(response);
  },

  deleteProductAttribute: async (attributeId) => {
    const response = await api.delete(
      `/apps/products/productattributes/${attributeId}/`
    );
    return handleApiResponse(response);
  },
};

// Utilidades para gestión de pedidos (vendedores/admins)
export const orderManagement = {
  // Obtener pedidos
  getOrders: async () => {
    const response = await api.get("/apps/orders/");
    return handleApiResponse(response);
  },

  // Obtener pedido específico
  getOrder: async (orderId) => {
    const response = await api.get(`/apps/orders/${orderId}/`);
    return handleApiResponse(response);
  },

  // Actualizar estado de pedido
  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`/apps/orders/${orderId}/`, { status });
    return handleApiResponse(response);
  },
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Función para obtener información del usuario desde el token
export const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.user_id,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
};

// Función para verificar si el token ha expirado
export const isTokenExpired = () => {
  const user = getUserFromToken();
  if (!user) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return user.exp < currentTime;
};

// Función para limpiar datos de autenticación
export const clearAuth = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};

// Función para guardar datos de autenticación
export const saveAuth = (accessToken, refreshToken, userData) => {
  localStorage.setItem("access", accessToken);
  if (refreshToken) {
    localStorage.setItem("refresh", refreshToken);
  }
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  }
};
