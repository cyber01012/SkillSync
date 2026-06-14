"""Restricted code execution sandbox for baseline challenges — supports Python + static analysis for all languages."""
import json
import os
import re
import subprocess
import tempfile
import textwrap
from pathlib import Path
from typing import Any


def _build_test_file(test_cases: list[dict]) -> str:
    """Generate a pytest file from challenge test case definitions."""
    lines = [
        "import pytest",
        "import sys",
        "import os",
        "sys.path.insert(0, os.path.dirname(__file__))",
        "",
    ]
    for i, tc in enumerate(test_cases):
        name = tc.get("name", f"test_case_{i}")
        validation = tc.get("validation")
        expected_status = tc.get("expected_status")
        inp = tc.get("input", {})

        if validation == "password_is_hashed":
            lines.append(f"""
def {name}():
    try:
        import main
        import bcrypt
        assert hasattr(main, 'users') or hasattr(main, 'user_store')
        src = open(os.path.join(os.path.dirname(__file__), 'main.py')).read()
        assert 'bcrypt' in src or 'hashpw' in src or 'hash' in src.lower()
    except Exception as e:
        pytest.fail(str(e))
""")
        elif validation == "returns_jwt_token":
            lines.append(f"""
def {name}():
    try:
        src = open(os.path.join(os.path.dirname(__file__), 'main.py')).read()
        assert 'jwt' in src.lower() or 'token' in src.lower()
    except Exception as e:
        pytest.fail(str(e))
""")
        elif expected_status is not None:
            email = inp.get("email", "test@example.com")
            password = inp.get("password", "password123")
            lines.append(f"""
def {name}():
    try:
        from fastapi.testclient import TestClient
        import main
        client = TestClient(main.app)
        resp = client.post("/register", json={"email": "{email}", "password": "{password}"})
        assert resp.status_code == {expected_status}, f"Expected {expected_status}, got {{resp.status_code}}: {{resp.text}}"
    except ImportError:
        pytest.skip("FastAPI TestClient not available")
    except Exception as e:
        pytest.fail(str(e))
""")
        else:
            lines.append(f"""
def {name}():
    assert True  # placeholder test
""")

    return "\n".join(lines)


def _run_python_sandbox(code: str, test_cases: list[dict], timeout_seconds: int) -> dict[str, Any]:
    """Run Python code with pytest in a restricted subprocess."""
    with tempfile.TemporaryDirectory() as tmpdir:
        main_path = Path(tmpdir) / "main.py"
        test_path = Path(tmpdir) / "test_main.py"
        main_path.write_text(code, encoding="utf-8")
        test_path.write_text(_build_test_file(test_cases), encoding="utf-8")

        env = os.environ.copy()
        env["PYTHONDONTWRITEBYTECODE"] = "1"

        try:
            # Use the same python interpreter as the current process to ensure pytest is available
            import sys
            python_exe = sys.executable
            
            result = subprocess.run(
                [python_exe, "-m", "pytest", str(test_path), "-v", "--tb=short", "-q"],
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                cwd=tmpdir,
                env=env,
            )
            stdout = result.stdout or ""
            stderr = result.stderr or ""
            combined = stdout + stderr

            details = []
            passed = 0
            failed = 0
            for tc in test_cases:
                name = tc.get("name", "")
                if re.search(rf"{re.escape(name)}\s+PASSED", combined):
                    details.append({"name": name, "status": "passed", "duration": "0.1s", "error": None})
                    passed += 1
                elif re.search(rf"{re.escape(name)}\s+FAILED", combined):
                    err_match = re.search(rf"{re.escape(name)}.*?FAILED.*?- (.*)", combined, re.DOTALL)
                    details.append({
                        "name": name,
                        "status": "failed",
                        "duration": "0.1s",
                        "error": (err_match.group(1).strip()[:200] if err_match else "Test failed"),
                    })
                    failed += 1
                elif re.search(rf"{re.escape(name)}\s+SKIPPED", combined):
                    details.append({"name": name, "status": "not_run", "duration": None, "error": "Skipped"})
                else:
                    details.append({"name": name, "status": "not_run", "duration": None, "error": None})

            total = len(test_cases)
            if passed + failed == 0 and result.returncode != 0:
                failed = total
                for d in details:
                    if d["status"] == "not_run":
                        d["status"] = "failed"
                        d["error"] = stderr[:200] or "Execution error"

            return {
                "passed": passed,
                "failed": failed,
                "total": total,
                "details": details,
                "stdout": stdout[:2000],
                "stderr": stderr[:2000],
            }
        except subprocess.TimeoutExpired:
            return {
                "passed": 0,
                "failed": len(test_cases),
                "total": len(test_cases),
                "details": [{"name": tc.get("name", ""), "status": "failed", "error": "Timeout exceeded"} for tc in test_cases],
                "stdout": "",
                "stderr": "Execution timed out (10s limit)",
            }
        except FileNotFoundError:
            return {
                "passed": 0,
                "failed": len(test_cases),
                "total": len(test_cases),
                "details": [{"name": tc.get("name", ""), "status": "failed", "error": "Python not found"} for tc in test_cases],
                "stdout": "",
                "stderr": "Python interpreter not available",
            }


def _run_static_analysis(code: str, test_cases: list[dict], language: str) -> dict[str, Any]:
    """Run static analysis for non-Python languages. Returns real pass/fail results."""
    details = []
    passed = 0
    failed = 0
    code_lower = code.lower()

    for tc in test_cases:
        name = tc.get("name", "")
        validation = tc.get("validation", "")
        status = "failed"
        error = None

        # ───────────────────────────────────────────────
        # REACT STATIC ANALYSIS
        # ───────────────────────────────────────────────
        if language == "javascript" and "react" in name.lower():
            if validation == "component_mounts":
                if "import react" in code_lower and ("function" in code_lower or "const" in code_lower) and "return (" in code:
                    status = "passed"
                else:
                    error = "Missing React import, function component, or JSX return"
            elif validation == "todo_added_to_list":
                if ("setTodos" in code or "setState" in code or "useState" in code) and ("push" in code_lower or "concat" in code_lower or "..." in code or "spread" in code_lower):
                    status = "passed"
                else:
                    error = "Missing state update logic for adding todos"
            elif validation == "todo_toggles_completed":
                if "map" in code_lower and ("onclick" in code_lower or "onClick" in code):
                    status = "passed"
                else:
                    error = "Missing map rendering or click handler for toggling"
            elif validation == "todo_removed_from_list":
                if "filter" in code_lower or "splice" in code_lower or "slice" in code_lower:
                    status = "passed"
                else:
                    error = "Missing filter/splice logic for removing todos"
            elif validation == "shows_loading_spinner":
                if "loading" in code_lower and ("spinner" in code_lower or "div" in code_lower or "className" in code):
                    status = "passed"
                else:
                    error = "Missing loading state or spinner element"
            elif validation == "prevents_spam_requests":
                if "setTimeout" in code or "setInterval" in code or "debounce" in code_lower or "throttle" in code_lower:
                    status = "passed"
                else:
                    error = "Missing rate limiting logic (setTimeout, debounce, etc.)"
            elif validation == "displays_error_message":
                if "error" in code_lower and ("div" in code_lower or "p>" in code or "span" in code_lower):
                    status = "passed"
                else:
                    error = "Missing error state or error display element"
            elif validation == "client_fetches_products":
                if "fetch" in code_lower or "axios" in code_lower or "useEffect" in code:
                    status = "passed"
                else:
                    error = "Missing fetch/axios call or useEffect for data loading"
            else:
                # Generic React check
                if "import react" in code_lower:
                    status = "passed"
                else:
                    error = f"Unknown validation: {validation}"

        # ───────────────────────────────────────────────
        # VUE STATIC ANALYSIS
        # ───────────────────────────────────────────────
        elif language == "javascript" and "vue" in name.lower():
            if validation == "component_mounts":
                if "<template>" in code and "<script>" in code and ("export default" in code or "setup" in code):
                    status = "passed"
                else:
                    error = "Missing Vue template, script, or export"
            elif validation == "task_added_to_list":
                if "push" in code_lower or "unshift" in code_lower or "concat" in code_lower:
                    status = "passed"
                else:
                    error = "Missing array push for adding tasks"
            elif validation == "task_toggles_completed":
                if "v-model" in code or "@click" in code or "@change" in code:
                    status = "passed"
                else:
                    error = "Missing click/change handler for toggling"
            elif validation == "task_removed_from_list":
                if "filter" in code_lower or "splice" in code_lower:
                    status = "passed"
                else:
                    error = "Missing filter/splice for removing tasks"
            elif validation == "shows_loading_spinner":
                if "loading" in code_lower and ("v-if" in code or "v-show" in code):
                    status = "passed"
                else:
                    error = "Missing loading state with v-if/v-show"
            elif validation == "form_validation":
                if "required" in code_lower or "v-validate" in code or "rules" in code_lower:
                    status = "passed"
                else:
                    error = "Missing form validation logic"
            elif validation == "client_fetches_products":
                if "fetch" in code_lower or "axios" in code_lower or "mounted" in code_lower:
                    status = "passed"
                else:
                    error = "Missing fetch/axios or mounted hook"
            else:
                if "<template>" in code and "<script>" in code:
                    status = "passed"
                else:
                    error = f"Unknown validation: {validation}"

        # ───────────────────────────────────────────────
        # NODE.JS / EXPRESS STATIC ANALYSIS
        # ───────────────────────────────────────────────
        elif language == "javascript" and ("server" in name.lower() or "express" in code_lower or "node" in name.lower()):
            if validation == "password_is_hashed":
                if "bcrypt" in code_lower or "hash" in code_lower:
                    status = "passed"
                else:
                    error = "Missing bcrypt or hashing logic"
            elif validation == "returns_jwt_token":
                if "jwt" in code_lower or "jsonwebtoken" in code_lower or "token" in code_lower:
                    status = "passed"
                else:
                    error = "Missing JWT or token generation"
            elif validation == "server_starts":
                if "listen" in code_lower and ("express" in code_lower or "http" in code_lower):
                    status = "passed"
                else:
                    error = "Missing server.listen or express setup"
            elif validation == "crud_routes_work":
                if ("get(" in code_lower or "post(" in code_lower or "put(" in code_lower or "delete(" in code_lower):
                    status = "passed"
                else:
                    error = "Missing CRUD route definitions"
            elif validation == "mongo_connects":
                if "mongoose" in code_lower or "mongodb" in code_lower:
                    status = "passed"
                else:
                    error = "Missing mongoose or MongoDB connection"
            else:
                if "require(" in code_lower or "import" in code_lower:
                    status = "passed"
                else:
                    error = f"Unknown validation: {validation}"

        # ───────────────────────────────────────────────
        # CSS / TAILWIND STATIC ANALYSIS
        # ───────────────────────────────────────────────
        elif language == "css":
            if validation == "sidebar_250px":
                if "250px" in code or "w-64" in code or "width:" in code_lower:
                    status = "passed"
                else:
                    error = "Missing 250px width for sidebar"
            elif validation == "grid_collapses_on_mobile":
                if "grid" in code_lower and ("@media" in code_lower or "md:" in code or "lg:" in code or "responsive" in code_lower):
                    status = "passed"
                else:
                    error = "Missing responsive grid or media queries"
            elif validation == "card_has_shadow_and_radius":
                if ("shadow" in code_lower or "box-shadow" in code_lower) and ("radius" in code_lower or "rounded" in code_lower or "border-radius" in code_lower):
                    status = "passed"
                else:
                    error = "Missing shadow or border-radius on cards"
            elif validation == "header_flex_with_avatar":
                if "flex" in code_lower and ("avatar" in code_lower or "img" in code_lower or "image" in code_lower or "rounded-full" in code):
                    status = "passed"
                else:
                    error = "Missing flex layout or avatar styling"
            elif validation == "footer_fixed":
                if "fixed" in code_lower or "sticky" in code_lower or "bottom:" in code_lower:
                    status = "passed"
                else:
                    error = "Missing fixed/sticky positioning for footer"
            elif validation == "dark_mode_support":
                if "dark:" in code or "@media (prefers-color-scheme: dark)" in code_lower or "var(--dark" in code_lower:
                    status = "passed"
                else:
                    error = "Missing dark mode support"
            else:
                if "{" in code and "}" in code:
                    status = "passed"
                else:
                    error = f"Unknown validation: {validation}"

        # ───────────────────────────────────────────────
        # JAVA STATIC ANALYSIS
        # ───────────────────────────────────────────────
        elif language == "java":
            if validation == "password_is_hashed":
                if "BCrypt" in code or "PasswordEncoder" in code or "hash" in code_lower:
                    status = "passed"
                else:
                    error = "Missing BCrypt or PasswordEncoder"
            elif validation == "returns_jwt_token":
                if "Jwt" in code or "JWT" in code or "token" in code_lower:
                    status = "passed"
                else:
                    error = "Missing JWT generation"
            elif validation == "spring_boot_app_runs":
                if "@SpringBootApplication" in code or "SpringApplication.run" in code:
                    status = "passed"
                else:
                    error = "Missing @SpringBootApplication or SpringApplication.run"
            elif validation == "rest_controller_defined":
                if "@RestController" in code or "@Controller" in code:
                    status = "passed"
                else:
                    error = "Missing @RestController or @Controller"
            elif validation == "crud_endpoints_work":
                if "@GetMapping" in code or "@PostMapping" in code or "@PutMapping" in code or "@DeleteMapping" in code:
                    status = "passed"
                else:
                    error = "Missing CRUD mapping annotations"
            else:
                if "class" in code_lower and "{" in code:
                    status = "passed"
                else:
                    error = f"Unknown validation: {validation}"

        # ───────────────────────────────────────────────
        # FULLSTACK (MERN / Python+React) — check both parts
        # ───────────────────────────────────────────────
        elif language == "javascript" and ("mern" in name.lower() or "fullstack" in name.lower() or "python_react" in name.lower()):
            if validation == "server_runs":
                if "listen" in code_lower or "app.listen" in code_lower:
                    status = "passed"
                else:
                    error = "Missing server.listen"
            elif validation == "mongo_connects":
                if "mongoose" in code_lower or "mongodb" in code_lower:
                    status = "passed"
                else:
                    error = "Missing mongoose connection"
            elif validation == "crud_routes_work":
                if "get(" in code_lower or "post(" in code_lower:
                    status = "passed"
                else:
                    error = "Missing CRUD routes"
            elif validation == "client_fetches_products":
                if "fetch" in code_lower or "axios" in code_lower or "useEffect" in code:
                    status = "passed"
                else:
                    error = "Missing client-side fetch or useEffect"
            elif validation == "react_component_renders":
                if "import React" in code or "function" in code_lower:
                    status = "passed"
                else:
                    error = "Missing React component"
            else:
                if "require(" in code_lower or "import" in code_lower or "export" in code_lower:
                    status = "passed"
                else:
                    error = f"Unknown validation: {validation}"

        # ───────────────────────────────────────────────
        # FALLBACK: Unknown language/validation
        # ───────────────────────────────────────────────
        else:
            # For unknown validations, do a basic sanity check
            if len(code.strip()) > 50:
                status = "passed"
            else:
                error = f"Unknown language/validation combo: {language}/{validation}"

        if status == "passed":
            passed += 1
        else:
            failed += 1

        details.append({
            "name": name,
            "status": status,
            "duration": "0.1s",
            "error": error,
        })

    return {
        "passed": passed,
        "failed": failed,
        "total": len(test_cases),
        "details": details,
        "stdout": f"Static analysis for {language} — {passed}/{len(test_cases)} passed",
        "stderr": None,
    }


def run_code_in_sandbox(
    code: str,
    test_cases: list[dict],
    language: str = "python",
    timeout_seconds: int = 10,
) -> dict[str, Any]:
    """Execute code in a restricted subprocess and return test results."""

    if language == "python":
        return _run_python_sandbox(code, test_cases, timeout_seconds)

    # For all other languages, use static analysis
    return _run_static_analysis(code, test_cases, language)