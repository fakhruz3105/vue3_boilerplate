import axios, { type AxiosRequestConfig } from 'axios'

export async function GET (url: string, options?: AxiosRequestConfig) {
  const res = await axios.get(url, options)
  return res.data
}

export async function POST (url: string, body?: Record<string, any> | null, options?: AxiosRequestConfig) {
  const res = await axios.post(url, body, options)
  return res.data
}

export async function PUT (url: string, body?: Record<string, any> | null, options?: AxiosRequestConfig) {
  const res = await axios.put(url, body, options)
  return res.data
}

export async function DELETE (url: string, options?: AxiosRequestConfig) {
  const res = await axios.delete(url, options)
  return res.data
}