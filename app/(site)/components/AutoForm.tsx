'use client'

import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import {BsGithub, BsGoogle} from 'react-icons/bs';
import Button from "@/app/components/Button"
import Input from "@/app/components/inputs/Input"
import AuthSocialButton from "./AuthSocialButton"
import { toast } from "react-hot-toast";
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Variant='LOGIN'|'REGISTER'

const AutoForm = () => {
    const session = useSession()
    const router=useRouter()
    const [variant,setVariant]=useState<Variant>('LOGIN')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if(session?.status==='authenticated'){
            router.push('/users')
        }
    },[session?.status,router])
    
    const toggleVariant = useCallback(() => {
        if (variant === 'LOGIN') {
            setVariant('REGISTER')
        } else {
            setVariant('LOGIN')
        }
    }, [variant])
    
    const {
        register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })

    const onSubmit:SubmitHandler<FieldValues> = (data) => { 
        setIsLoading(true)

        if (variant === 'REGISTER') {
            axios.post('/api/register', data)
            .then(()=>signIn('credentials',data))
            .catch(() => toast.error('Something went wrong'))
            .finally(() => setIsLoading(false))
        }
         if (variant === 'LOGIN') {
             signIn('credentials', {
                 ...data,
                 redirect: false
             })
            .then((callback) => {
                if (callback?.error) {
                    toast.error('Invalid credentials')
                }
                if (callback?.ok&&!callback?.error) { 
                    toast.success('Logged in!')
                    router.push('/users')
                }
            })
            .finally(()=>setIsLoading(false))
        }
    }

    const socialAction = (action: string) => {
        setIsLoading(true)
        signIn(action, { redirect: false }).then((callback) => {
            if (callback?.error) {
                toast.error('Invalid credentials')
            }
            if (callback?.ok&&!callback?.error) { 
                toast.success('Logged in!')
            }
        }).finally(()=>setIsLoading(false))
    }

    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {variant==='REGISTER'&&(
                        <Input
                            id="name"
                            label="Name"
                            register={register}
                            errors={errors}
                            disabled={isLoading}
                        />
                    )}
                    <Input
                        id="email"
                        label="Email 
                        address"
                        type="email"
                        register={register}
                        errors={errors}
                        disabled={isLoading}
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        register={register}
                        errors={errors}
                        disabled={isLoading}
                    />
                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type="submit"
                        >
                            {
                                variant==='LOGIN'? 'Sign in' : 'Register'
                            }
                        </Button>
                    </div>
                </form>
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center ">
                            <div className="w-full border-t border-gray-300 " />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 text-gray-500 bg-white">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <AuthSocialButton icon={BsGithub} onClick={()=>socialAction('github')}/>
                        <AuthSocialButton icon={BsGoogle} onClick={()=>socialAction('google')}/>
                    </div>
                </div>
                <div className="flex justify-center gap-2 px-2 mt-6 text-sm">
                    <div>
                        {variant==='LOGIN'?'New to Messenger?':'Already have an account?'}
                    </div>
                    <div
                        onClick={toggleVariant}
                        className="underline cursor-pointer"
                    >
                        {variant==='LOGIN'?'Create an account?':'Login'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AutoForm