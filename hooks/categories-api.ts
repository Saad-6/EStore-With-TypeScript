import { Category } from "@/interfaces/product-interfaces";
import { useState } from "react";
import toast from "react-hot-toast";


export function CategoriesApi(){
const API_BASE_URL = 'https://localhost:7007/api';
const [categories, setCategories] = useState<Category[]>([])

    const fetchCategories = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/Category`)
          if (response.ok) {
            const data = await response.json()
            setCategories(data)
          } else {
            toast.error('Failed to fetch categories')
          }
        } catch (error) {
          console.error('Error fetching categories:', error)
          toast.error('An error occurred while fetching categories')
        }
      }
      const addCategory = async (newCategory : Category) =>{
        try {
            const response = await fetch(`${API_BASE_URL}/Category`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newCategory),
            })
            if (response.ok) {
              const addedCategory = await response.json()
              setCategories([...categories, addedCategory])
           //   setIsAddCategoryModalOpen(false)
           //   setNewCategory({ name: '', description: '', thumbNailUrl: '' })
              toast.success('Category added successfully')
            } else {
              toast.error('Failed to add category')
            }
          } catch (error) {
            console.error('Error adding category:', error)
            toast.error('An error occurred while adding the category')
          }
      }

}