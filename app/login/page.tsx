'use client'

import React, { useState } from 'react'
import styles from './page.module.css';
import { Input } from "@/components/ui/input"
import Header from '../components/header';
import { useRouter } from 'next/navigation'
import { loginUserFromDb } from '../firebase/firebase';
import { useAuth } from "../context/page"

export default function Login() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');

    const { login } = useAuth();

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await loginUserFromDb(username, password, userType);

            if (user) {
                alert("Logged in successfully!");
                login({
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    type: userType
                });
                router.push('/');
                setUsername("");
                setPassword("");
                setUserType('buyer');
            } else {
                alert("Login failed. Please check your username and password..");
            }

        } catch (error) {
            alert("Login failed. Please check your username and password.");
            console.error(error);
        }
    };

    const handleRegister = () => {
        router.push('/register');
    }

    return (
        <div className={styles.pageWrapper}>
            <Header />
            <div className={styles.container}>
                <form className={styles.form} onSubmit={handleFormSubmit}>
                    <h1 className={styles.title}>Log in</h1>

                    <div className={styles.toggleContainer}>
                        <button
                            type="button"
                            className={userType === 'buyer' ? styles.activeBtn : styles.toggleBtn}
                            onClick={() => setUserType('buyer')}
                        >
                            Buyer
                        </button>
                        <button
                            type="button"
                            className={userType === 'seller' ? styles.activeBtn : styles.toggleBtn}
                            onClick={() => setUserType('seller')}
                        >
                            Seller
                        </button>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}></label>
                        <Input
                            // The type should be "text" for a username input
                            type="text"
                            placeholder="Username"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}></label>
                        <Input
                            type="password"
                            placeholder='Password'
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <button type="submit" className={styles.button}>Log In</button>
                    <div style={{ textAlign: 'center' }}>
                        <button
                            type="button"
                            style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'white' }}
                            onClick={handleRegister}
                        >
                            New User? Create now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}