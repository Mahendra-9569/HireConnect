import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Panel } from '../components/UI'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10">
      <Panel className="w-full text-center">
        <div className="text-6xl font-black text-slate-950 dark:text-white">404</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          The route does not exist or the role-based screen is hidden for this account.
        </p>
        <Link to="/" className="mt-6 inline-flex">
          <Button type="button">Go home</Button>
        </Link>
      </Panel>
    </div>
  )
}
