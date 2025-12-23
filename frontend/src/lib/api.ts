const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error');
  }
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<ApiResponse<{ user: any; tokens: { accessToken: string; refreshToken: string } }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.data) {
      throw new Error('Invalid response format');
    }
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher';
  }) => {
    const response = await apiRequest<ApiResponse<{ user: any; tokens: { accessToken: string; refreshToken: string } }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (!response.data) {
      throw new Error('Invalid response format');
    }
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiRequest<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.data) {
      throw new Error('Invalid response format');
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await apiRequest<ApiResponse<{ user: any }>>('/auth/profile');
    if (!response.data) {
      throw new Error('Invalid response format');
    }
    return response.data;
  },
};

export const assignmentApi = {
  getAll: async () => {
    const response = await apiRequest<{ data: any[]; pagination: any }>('/assignments');
    return { assignments: response.data };
  },

  getById: async (id: string) => {
    const response = await apiRequest<{ data: any }>(`/assignments/${id}`);
    return { assignment: response.data };
  },

  create: async (assignmentData: {
    title: string;
    description: string;
    dueDate: string;
    allowedSubmissionType?: 'TEXT' | 'FILE';
    maxScore?: number;
    rubricId?: string;
  }) => {
    return apiRequest<{ assignment: any }>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  update: async (id: string, assignmentData: Partial<{
    title: string;
    description: string;
    dueDate: string;
    allowedSubmissionType?: 'TEXT' | 'FILE';
    maxScore?: number;
    rubricId?: string;
  }>) => {
    return apiRequest<{ assignment: any }>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },
};

export const submissionApi = {
  getAll: async (assignmentId?: string) => {
    if (assignmentId) {
      const response = await apiRequest<{ data: any[]; pagination: any }>(`/submissions/assignment/${assignmentId}`);
      return { submissions: response.data || [] };
    } else {
      const response = await apiRequest<{ data: any[] }>('/submissions');
      return { submissions: response.data || [] };
    }
  },

  getMySubmissions: async () => {
    const response = await apiRequest<{ data: any[]; pagination: any }>('/submissions/my');
    return { submissions: response.data || [] };
  },

  getTeacherAssignmentsWithSubmissions: async () => {
    const response = await apiRequest<{ data: any[] }>('/submissions/teacher/assignments-with-submissions');
    return { assignments: response.data || [] };
  },

  getStudentAssignmentsWithSubmissions: async () => {
    const response = await apiRequest<{ data: any[] }>('/submissions/student/assignments-with-my-submissions');
    return { assignments: response.data || [] };
  },

  getById: async (id: string) => {
    return apiRequest<{ submission: any }>(`/submissions/${id}`);
  },

  create: async (submissionData: {
    assignmentId: string;
    content: string;
    files?: File[];
  }) => {
    const formData = new FormData();
    formData.append('content', submissionData.content);

    if (submissionData.files && submissionData.files.length > 0) {
      formData.append('file', submissionData.files[0]);
    }

    return apiRequest<{ data: any }>(`/submissions/${submissionData.assignmentId}`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  update: async (id: string, submissionData: Partial<{
    content: string;
    files?: File[];
  }>) => {
    const formData = new FormData();
    if (submissionData.content) {
      formData.append('content', submissionData.content);
    }

    if (submissionData.files) {
      submissionData.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    }

    return apiRequest<{ submission: any }>(`/submissions/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {},
    });
  },
};

export const evaluationApi = {
  evaluate: async (submissionId: string, evaluationData: {
    score: number;
    feedback: string;
  }) => {
    return apiRequest<{ evaluation: any }>(`/evaluations/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    });
  },

  getBySubmissionId: async (submissionId: string) => {
    return apiRequest<{ evaluation: any }>(`/evaluations/submission/${submissionId}`);
  },
};

export { apiRequest, ApiError };
