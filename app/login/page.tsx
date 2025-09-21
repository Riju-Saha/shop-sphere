'use client'

import React, { useState } from 'react'
import styles from './page.module.css';
import { Input } from "@/components/ui/input"
import Header from '../components/header';
import { useRouter } from 'next/navigation'


export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('buyer');

    const handleFormSubmit = (e: any) => {
        e.preventDefault();
        alert("Form submitted!");
        console.log({ email, password, userType });
    }

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
                        <label htmlFor="email" className={styles.label}></label>
                        <Input
                            type="email"
                            placeholder="Email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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