'use client'

import React, { useState } from 'react'
import styles from './page.module.css';
import { Input } from "@/components/ui/input"
import Header from '../components/header';
import { useRouter } from 'next/navigation'
import { registerUserToDb } from '../firebase/firebase';


export default function Register() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');

    const handleFormSubmit = async (e: any) => {
        e.preventDefault();
        const userData = {
            name,
            username,
            email,
            userType,
            password,
            createdAt: new Date()
        };
        await registerUserToDb(userData);
<<<<<<< HEAD
        alert("Account created sucessfully");
        if (userType == "buyer") {
            router.push('/buyers')
        } else {
            router.push('/sellers')
        }
=======
        alert("Form submitted!");
>>>>>>> 771db244772471c06684d1bc808c6c83c7715043
        console.log({ name, username, email, password, userType });

        setName("");
        setUsername("")
        setEmail("")
        setPassword("")
        setUserType('buyer');
    }

    const handleLogin = () => {
        router.push('/login');
    }

    return (
        <div className={styles.pageWrapper}>
            <Header />
            <div className={styles.container}>
                <form className={styles.form} onSubmit={handleFormSubmit}>
                    <h1 className={styles.title}>Create Account</h1>

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
                        <label htmlFor="name" className={styles.label}></label>
                        <Input
                            type="text"
                            placeholder="Name"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}></label>
                        <Input
                            type="text"
                            placeholder="Username"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                        />
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

                    <button type="submit" className={styles.button}>Create Account</button>
                    <div style={{ textAlign: 'center' }}>
                        <button type='button' style={{ cursor: 'pointer', border: 'none', background: 'none' }} onClick={handleLogin}>
                            Already a User? Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}