"use client"; 
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function logout(){

    const router = useRouter()
    useEffect(()=>{
        localStorage.removeItem('token');
        router.push('/login')
    },[])
}