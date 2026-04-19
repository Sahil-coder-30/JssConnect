const fs = require('fs');

const collection = {
	info: {
		name: "JSS Connect APIs",
		schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	item: [
        {
            name: "Auth",
            item: [
                {
                    name: "Register",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        url: { raw: "http://localhost:3000/api/auth/register", host: ["http://localhost:3000"], path: ["api", "auth", "register"] },
                        body: { mode: "raw", raw: JSON.stringify({ username: "testuser", email: "testuser@example.com", password: "password123" }, null, 2) }
                    }
                },
                {
                    name: "Login",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        url: { raw: "http://localhost:3000/api/auth/login", host: ["http://localhost:3000"], path: ["api", "auth", "login"] },
                        body: { mode: "raw", raw: JSON.stringify({ email: "sahilsharma3043@gmail.com", password: "Sahil@987" }, null, 2) }
                    }
                },
                {
                    name: "Get Me (Profile)",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "http://localhost:3000/api/auth/me", host: ["http://localhost:3000"], path: ["api", "auth", "me"] }
                    }
                },
                {
                    name: "Logout",
                    request: {
                        method: "POST",
                        header: [],
                        url: { raw: "http://localhost:3000/api/auth/logout", host: ["http://localhost:3000"], path: ["api", "auth", "logout"] }
                    }
                }
            ]
        },
        {
            name: "Profile",
            item: [
                {
                    name: "Create Profile",
                    request: {
                        method: "POST",
                        header: [],
                        url: { raw: "http://localhost:3000/api/profile/", host: ["http://localhost:3000"], path: ["api", "profile", ""] },
                        body: {
                            mode: "formdata",
                            formdata: [
                                { key: "role", value: "Student", type: "text" },
                                { key: "name", value: "Test User", type: "text" },
                                { key: "bio", value: "Hello world!", type: "text" }
                            ]
                        }
                    }
                },
                {
                    name: "Get My Profile",
                    request: {
                        method: "GET",
                        header: [],
                        url: { raw: "http://localhost:3000/api/profile/me", host: ["http://localhost:3000"], path: ["api", "profile", "me"] }
                    }
                }
            ]
        },
        {
            name: "Developer",
            item: [
                {
                    name: "Verify Master",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        url: { raw: "http://localhost:3000/api/developer/verify-master", host: ["http://localhost:3000"], path: ["api", "developer", "verify-master"] },
                        body: { mode: "raw", raw: JSON.stringify({ masterId: "supreme_admin", masterPassword: "jss_secure_pass_2026" }, null, 2) }
                    }
                }
            ]
        }
	]
};

fs.writeFileSync('JssConnect.postman_collection.json', JSON.stringify(collection, null, 2));
console.log('Postman collection created: JssConnect.postman_collection.json');
