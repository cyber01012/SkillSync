"""Baseline challenge seed data — 32 challenges, 4 per specialty."""
from datetime import datetime

# ──────────────────────────────────────────────────────────────
# BACKEND: Python
# ──────────────────────────────────────────────────────────────
PYTHON_STARTER = '''from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import bcrypt

app = FastAPI()
users = {}

class UserRegister(BaseModel):
    email: str
    password: str

@app.post("/register")
async def register(user: UserRegister):
    # TODO: Implement password hashing and user storage
    return {"message": "User registered"}
'''

PYTHON_TESTS = [
    {"name": "test_register_valid_user", "input": {"email": "alice@example.com", "password": "secure123"}, "expected_status": 200},
    {"name": "test_password_hashing", "input": {"email": "bob@example.com", "password": "password123"}, "validation": "password_is_hashed"},
    {"name": "test_jwt_generation", "input": {"email": "charlie@example.com", "password": "jwtpass"}, "validation": "returns_jwt_token"},
]

PYTHON_PROMPT = (
    "Evaluate this Python FastAPI code for a JWT authentication system. "
    "Rate 0-100 on: 1) Technical Accuracy, 2) Creativity, 3) Communication. "
    'Return ONLY JSON: {"technical": X, "creativity": Y, "performance": Z}'
)

PYTHON_PACKAGES = ["fastapi", "pydantic", "bcrypt", "python-jose", "pytest", "httpx"]

# ──────────────────────────────────────────────────────────────
# BACKEND: Java
# ──────────────────────────────────────────────────────────────
JAVA_STARTER = '''import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
public class AuthApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }
}

@RestController
class AuthController {
    @PostMapping("/register")
    public String register(@RequestBody User user) {
        // TODO: Hash password and store user
        return "User registered";
    }
}

class User {
    public String email;
    public String password;
}
'''

JAVA_TESTS = [
    {"name": "test_register_valid_user", "input": {"email": "alice@example.com", "password": "secure123"}, "expected_status": 200},
    {"name": "test_password_hashing", "input": {"email": "bob@example.com", "password": "password123"}, "validation": "password_is_hashed"},
    {"name": "test_jwt_generation", "input": {"email": "charlie@example.com", "password": "jwtpass"}, "validation": "returns_jwt_token"},
]

JAVA_PROMPT = (
    "Evaluate this Java Spring Boot code for a JWT authentication system. "
    "Rate 0-100 on: 1) Technical Accuracy, 2) Creativity, 3) Communication. "
    'Return ONLY JSON: {"technical": X, "creativity": Y, "performance": Z}'
)

JAVA_PACKAGES = ["spring-boot-starter-web", "spring-security-crypto", "jjwt", "junit", "mockito"]

# ──────────────────────────────────────────────────────────────
# BACKEND: Node.js
# ──────────────────────────────────────────────────────────────
NODEJS_STARTER = '''const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const users = [];

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    // TODO: Hash password and store user
    res.json({ message: 'User registered' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
'''

NODEJS_TESTS = [
    {"name": "test_register_valid_user", "input": {"email": "alice@example.com", "password": "secure123"}, "expected_status": 200},
    {"name": "test_password_hashing", "input": {"email": "bob@example.com", "password": "password123"}, "validation": "password_is_hashed"},
    {"name": "test_jwt_generation", "input": {"email": "charlie@example.com", "password": "jwtpass"}, "validation": "returns_jwt_token"},
]

NODEJS_PROMPT = (
    "Evaluate this Node.js Express code for a JWT authentication system. "
    "Rate 0-100 on: 1) Technical Accuracy, 2) Creativity, 3) Communication. "
    'Return ONLY JSON: {"technical": X, "creativity": Y, "performance": Z}'
)

NODEJS_PACKAGES = ["express", "bcrypt", "jsonwebtoken", "jest", "supertest"]

# ──────────────────────────────────────────────────────────────
# FRONTEND: React
# ──────────────────────────────────────────────────────────────
REACT_STARTER = '''import React, { useState, useEffect } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // TODO: Implement addTodo function
  // TODO: Implement deleteTodo function
  // TODO: Implement toggleComplete function
  // TODO: Fetch todos from API on mount

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Add a new task..."
        />
        <button className="bg-blue-500 text-white px-4 py-2">Add</button>
      </div>
      <ul>
        {/* TODO: Render todo items */}
      </ul>
    </div>
  );
}

export default TodoApp;
'''

REACT_TESTS = [
    {"name": "test_component_renders", "validation": "component_mounts"},
    {"name": "test_add_todo", "input": {"text": "Buy groceries"}, "validation": "todo_added_to_list"},
    {"name": "test_toggle_complete", "input": {"id": 1}, "validation": "todo_toggles_completed"},
    {"name": "test_delete_todo", "input": {"id": 1}, "validation": "todo_removed_from_list"},
]

REACT_PROMPT = (
    "Evaluate this React code for a Todo List application. "
    "Rate 0-100 on: 1) Technical Accuracy (hooks, state management, event handling), "
    "2) Creativity (elegant solution, reusable patterns), "
    "3) Communication (component structure, naming, comments). "
    'Return ONLY JSON: {"technical": X, "creativity": Y, "performance": Z}'
)

REACT_PACKAGES = ["react", "react-dom", "@testing-library/react", "jest"]

# ──────────────────────────────────────────────────────────────
# FRONTEND: Vue
# ──────────────────────────────────────────────────────────────
VUE_STARTER = '''<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Task Manager</h1>
    <div class="flex gap-2 mb-4">
      <input
        v-model="newTask"
        @keyup.enter="addTask"
        class="border p-2 flex-1"
        placeholder="Add a new task..."
      />
      <button @click="addTask" class="bg-green-500 text-white px-4 py-2">Add</button>
    </div>
    <ul>
      <li v-for="task in tasks" :key="task.id" class="flex items-center gap-2 p-2 border-b">
        <input type="checkbox" v-model="task.completed" />
        <span :class="{ 'line-through': task.completed }">{{ task.text }}</span>
        <button @click="removeTask(task.id)" class="text-red-500 ml-auto">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newTask: '',
      tasks: [],
    };
  },
  methods: {
    addTask() {
      // TODO: Implement addTask logic
    },
    removeTask(id) {
      // TODO: Implement removeTask logic
    },
  },
  mounted() {
    // TODO: Fetch tasks from API
  },
};
</script>
'''

VUE_TESTS = [
    {"name": "test_component_renders", "validation": "component_mounts"},
    {"name": "test_add_task", "input": {"text": "Learn Vue"}, "validation": "task_added_to_list"},
    {"name": "test_toggle_complete", "input": {"id": 1}, "validation": "task_toggles_completed"},
    {"name": "test_remove_task", "input": {"id": 1}, "validation": "task_removed_from_list"},
]

VUE_PROMPT = (
    "Evaluate this Vue.js code for a Task Manager application. "
    "Rate 0-100 on: 1) Technical Accuracy (directives, lifecycle, state management), "
    "2) Creativity (elegant solution, reusable patterns), "
    "3) Communication (template structure, naming, comments). "
    'Return ONLY JSON: {"technical": X, "creativity": Y, "performance": Z}'
)

VUE_PACKAGES = ["vue", "@vue/test-utils", "jest"]

# ──────────────────────────────────────────────────────────────
# FRONTEND: CSS / Tailwind
# ──────────────────────────────────────────────────────────────
CSS_STARTER = '''/* TODO: Build a responsive dashboard layout */
/* Requirements:
   - Sidebar (250px wide, collapsible on mobile)
   - Main content area with grid cards
   - Header with user avatar and notification bell
   - Footer fixed at bottom
   - Use Tailwind utility classes
*/

.dashboard {
  /* TODO: Implement grid layout */
}

.sidebar {
  /* TODO: Fixed width, full height */
}

.main-content {
  /* TODO: Responsive grid for cards */
}

.card {
  /* TODO: Styled card with shadow, rounded corners */
}
'''

CSS_TESTS = [
    {"name": "test_sidebar_width", "validation": "sidebar_250px"},
    {"name": "test_responsive_grid", "validation": "grid_collapses_on_mobile"},
    {"name": "test_card_styling", "validation": "card_has_shadow_and_radius"},
    {"name": "test_header_layout", "validation": "header_flex_with_avatar"},
]

CSS_PROMPT = (
    "Evaluate this CSS/Tailwind code for a responsive dashboard. "
    "Rate 0-100 on: 1) Technical Accuracy (layout, responsiveness, Tailwind usage), "
    "2) Creativity (elegant design, modern patterns), "
    "3) Communication (class naming, comments, structure). "
    'Return ONLY JSON: {"technical": X, "creativity": Y, "performance": Z}'
)

CSS_PACKAGES = ["tailwindcss", "postcss", "autoprefixer"]

# ──────────────────────────────────────────────────────────────
# FULLSTACK: MERN
# ──────────────────────────────────────────────────────────────
MERN_STARTER = '''// SERVER: Express + MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// TODO: Connect to MongoDB
// TODO: Define Product schema
// TODO: Implement CRUD routes (GET, POST, PUT, DELETE)

app.listen(5000, () => console.log('Server running on port 5000'));

// CLIENT: React (in src/App.jsx)
import React, { useState, useEffect } from 'react';

function ProductApp() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });

  // TODO: Fetch products from API on mount
  // TODO: Implement addProduct, updateProduct, deleteProduct

  return (
    <div className="p-4">
      <h1>Product Manager</h1>
      {/* TODO: Render product form and list */}
    </div>
  );
}

export default ProductApp;
'''

MERN_TESTS = [
    {"name": "test_server_runs", "validation": "express_server_starts"},
    {"name": "test_mongo_connection", "validation": "mongoose_connects"},
    {"name": "test_crud_routes", "validation": "all_routes_work"},
    {"name": "test_react_fetch", "validation": "client_fetches_products"},
]

MERN_PROMPT = (
    "Evaluate this MERN stack code for a Product Manager. "
    "Rate 0-100 on: 1) Technical Accuracy (Express, MongoDB, React integration), "
    "2) Creativity (elegant architecture, reusable patterns), "
    "3) Communication (code structure, naming, comments). "
    'Return ONLY JSON: {"technical": X, "creativity": Y, "performance": Z}'
)

MERN_PACKAGES = ["express", "mongoose", "cors", "react", "react-dom", "jest", "supertest"]

# ──────────────────────────────────────────────────────────────
# FULLSTACK: Python + React
# ──────────────────────────────────────────────────────────────
PYTHON_REACT_STARTER = '''# SERVER: FastAPI + SQLAlchemy
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = FastAPI()
Base = declarative_base()

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)

# TODO: Create database engine and tables
# TODO: Implement CRUD endpoints

# CLIENT: React (in src/App.jsx)
import React, { useState, useEffect } from 'react';

function ItemApp() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  // TODO: Fetch items from FastAPI on mount
  // TODO: Implement addItem, updateItem, deleteItem

  return (
    <div className="p-4">
      <h1>Item Manager</h1>
      {/* TODO: Render item form and list */}
    </div>
  );
}

export default ItemApp;
'''

PYTHON_REACT_TESTS = [
    {"name": "test_fastapi_runs", "validation": "fastapi_server_starts"},
    {"name": "test_sqlalchemy_models", "validation": "models_defined"},
    {"name": "test_crud_endpoints", "validation": "all_routes_work"},
    {"name": "test_react_fetch", "validation": "client_fetches_items"},
]

PYTHON_REACT_PROMPT = (
    "Evaluate this Python + React code for an Item Manager. "
    "Rate 0-100 on: 1) Technical Accuracy (FastAPI, SQLAlchemy, React integration), "
    "2) Creativity (elegant architecture, reusable patterns), "
    "3) Communication (code structure, naming, comments). "
    'Return ONLY JSON: {"technical": X, "creativity": Y, "performance": Z}'
)

PYTHON_REACT_PACKAGES = ["fastapi", "sqlalchemy", "pydantic", "react", "react-dom", "jest", "httpx"]

# ──────────────────────────────────────────────────────────────
# SPECIALTY CONFIGURATION
# ──────────────────────────────────────────────────────────────
SPECIALTY_CONFIG = {
    "python": {
        "prefix": "BL-PY",
        "label": "Python Backend",
        "starter": PYTHON_STARTER,
        "tests": PYTHON_TESTS,
        "prompt": PYTHON_PROMPT,
        "packages": PYTHON_PACKAGES,
        "language": "python",
    },
    "java": {
        "prefix": "BL-JV",
        "label": "Java Backend",
        "starter": JAVA_STARTER,
        "tests": JAVA_TESTS,
        "prompt": JAVA_PROMPT,
        "packages": JAVA_PACKAGES,
        "language": "java",
    },
    "nodejs": {
        "prefix": "BL-NJ",
        "label": "Node.js Backend",
        "starter": NODEJS_STARTER,
        "tests": NODEJS_TESTS,
        "prompt": NODEJS_PROMPT,
        "packages": NODEJS_PACKAGES,
        "language": "javascript",
    },
    "react": {
        "prefix": "BL-RT",
        "label": "React Frontend",
        "starter": REACT_STARTER,
        "tests": REACT_TESTS,
        "prompt": REACT_PROMPT,
        "packages": REACT_PACKAGES,
        "language": "javascript",
    },
    "vue": {
        "prefix": "BL-VU",
        "label": "Vue Frontend",
        "starter": VUE_STARTER,
        "tests": VUE_TESTS,
        "prompt": VUE_PROMPT,
        "packages": VUE_PACKAGES,
        "language": "javascript",
    },
    "css": {
        "prefix": "BL-CS",
        "label": "CSS/Tailwind",
        "starter": CSS_STARTER,
        "tests": CSS_TESTS,
        "prompt": CSS_PROMPT,
        "packages": CSS_PACKAGES,
        "language": "css",
    },
    "mern": {
        "prefix": "BL-MS",
        "label": "MERN Stack",
        "starter": MERN_STARTER,
        "tests": MERN_TESTS,
        "prompt": MERN_PROMPT,
        "packages": MERN_PACKAGES,
        "language": "javascript",
    },
    "python_react": {
        "prefix": "BL-PR",
        "label": "Python + React",
        "starter": PYTHON_REACT_STARTER,
        "tests": PYTHON_REACT_TESTS,
        "prompt": PYTHON_REACT_PROMPT,
        "packages": PYTHON_REACT_PACKAGES,
        "language": "python",
    },
}

DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"]

TITLES = {
    "python": {
        "beginner": "Build a JWT Authentication System",
        "intermediate": "Implement Rate-Limited API Gateway",
        "advanced": "Design Microservice with Circuit Breaker",
        "expert": "Build Real-Time Event Processing Pipeline",
    },
    "java": {
        "beginner": "Build a JWT Authentication System",
        "intermediate": "Implement Rate-Limited API Gateway",
        "advanced": "Design Microservice with Circuit Breaker",
        "expert": "Build Real-Time Event Processing Pipeline",
    },
    "nodejs": {
        "beginner": "Build a JWT Authentication System",
        "intermediate": "Implement Rate-Limited API Gateway",
        "advanced": "Design Microservice with Circuit Breaker",
        "expert": "Build Real-Time Event Processing Pipeline",
    },
    "react": {
        "beginner": "Build a Todo List with React Hooks",
        "intermediate": "Create a Rate-Limited API Client",
        "advanced": "Build a Real-Time Chat Interface",
        "expert": "Design a Complex Dashboard with Context API",
    },
    "vue": {
        "beginner": "Build a Task Manager with Vue Directives",
        "intermediate": "Create a Dynamic Form with Vue Composition API",
        "advanced": "Build a Real-Time Notification System",
        "expert": "Design a Complex Dashboard with Vuex",
    },
    "css": {
        "beginner": "Style a Responsive Landing Page",
        "intermediate": "Build a CSS Grid Dashboard Layout",
        "advanced": "Create Animated UI Components",
        "expert": "Design a Complete Design System",
    },
    "mern": {
        "beginner": "Build a Full-Stack Todo App",
        "intermediate": "Create a Product Manager with Auth",
        "advanced": "Build a Real-Time Collaboration Tool",
        "expert": "Design a Scalable E-Commerce Platform",
    },
    "python_react": {
        "beginner": "Build a Full-Stack Item Manager",
        "intermediate": "Create a Blog with FastAPI + React",
        "advanced": "Build a Real-Time Analytics Dashboard",
        "expert": "Design a Microservices Architecture",
    },
}

DESCRIPTIONS = {
    "python": {
        "beginner": "Create a FastAPI application with user registration, password hashing, and JWT token generation.",
        "intermediate": "Build an API gateway with request rate limiting and token validation middleware.",
        "advanced": "Implement a resilient microservice with circuit breaker pattern and health checks.",
        "expert": "Design a real-time event processing pipeline with async workers and dead-letter queue.",
    },
    "java": {
        "beginner": "Create a Spring Boot application with user registration, password hashing, and JWT token generation.",
        "intermediate": "Build an API gateway with request rate limiting and token validation middleware.",
        "advanced": "Implement a resilient microservice with circuit breaker pattern and health checks.",
        "expert": "Design a real-time event processing pipeline with async workers and dead-letter queue.",
    },
    "nodejs": {
        "beginner": "Create an Express application with user registration, password hashing, and JWT token generation.",
        "intermediate": "Build an API gateway with request rate limiting and token validation middleware.",
        "advanced": "Implement a resilient microservice with circuit breaker pattern and health checks.",
        "expert": "Design a real-time event processing pipeline with async workers and dead-letter queue.",
    },
    "react": {
        "beginner": "Create a React Todo List application with hooks, state management, and local storage persistence.",
        "intermediate": "Build a React API client with rate limiting, loading states, and error handling.",
        "advanced": "Implement a real-time chat interface with WebSocket connections and message threading.",
        "expert": "Design a complex analytics dashboard with Context API, custom hooks, and data visualization.",
    },
    "vue": {
        "beginner": "Create a Vue Task Manager with directives, event handling, and local storage persistence.",
        "intermediate": "Build a dynamic form wizard with Vue Composition API and validation.",
        "advanced": "Implement a real-time notification system with Vue 3 reactivity and WebSocket.",
        "expert": "Design a complex dashboard with Vuex state management, routing, and role-based access.",
    },
    "css": {
        "beginner": "Style a responsive landing page with Flexbox, Grid, and mobile-first approach.",
        "intermediate": "Build a dashboard layout with CSS Grid, sidebar navigation, and responsive cards.",
        "advanced": "Create animated UI components with CSS transitions, keyframes, and transform effects.",
        "expert": "Design a complete design system with CSS variables, component library, and dark mode.",
    },
    "mern": {
        "beginner": "Build a full-stack Todo application with Express, MongoDB, and React.",
        "intermediate": "Create a product manager with authentication, CRUD operations, and image upload.",
        "advanced": "Build a real-time collaboration tool with Socket.io, optimistic updates, and conflict resolution.",
        "expert": "Design a scalable e-commerce platform with microservices, payment integration, and analytics.",
    },
    "python_react": {
        "beginner": "Build a full-stack item manager with FastAPI, SQLAlchemy, and React.",
        "intermediate": "Create a blog platform with FastAPI backend, React frontend, and rich text editing.",
        "advanced": "Build a real-time analytics dashboard with FastAPI streaming, React charts, and WebSocket.",
        "expert": "Design a microservices architecture with FastAPI gateway, React portal, and service mesh.",
    },
}


def get_baseline_challenges():
    challenges = []
    now = datetime.utcnow()

    for specialty, config in SPECIALTY_CONFIG.items():
        for i, difficulty in enumerate(DIFFICULTIES):
            num = str(i + 1).zfill(3)
            challenges.append({
                "challenge_id": f"{config['prefix']}-{num}",
                "category": specialty,
                "difficulty": difficulty,
                "title": f"{TITLES[specialty][difficulty]} ({config['label']})",
                "description": DESCRIPTIONS[specialty][difficulty],
                "time_limit_minutes": 45 - i * 5,
                "starter_code": config["starter"],
                "test_cases": config["tests"],
                "preinstalled_packages": config["packages"],
                "ai_prompt_template": config["prompt"],
                "language": config["language"],
                "created_at": now,
            })

    return challenges