'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/rbac';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Edit, Trash2, Package, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { apiService } from '@/services/api.service';
import { Product, Category } from '@/types';
import { format } from 'date-fns';
import { PageSkeleton } from '@/components/ui/loading';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  available: boolean;
  imageUrl?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);

  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      categoryId: 0,
      available: true,
      imageUrl: '',
    },
  });

  const filterProducts = () => {
    if (selectedCategoryFilter) {
      setFilteredProducts(products.filter(p => p.categoryId === selectedCategoryFilter));
    } else {
      setFilteredProducts(products);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategoryFilter, filterProducts]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        apiService.getProducts({ page: 0, size: 100 }),
        apiService.getCategories({ page: 0, size: 100 }),
      ]);
      const productsData = productsResponse.data.content;
      const categoriesData = categoriesResponse.data.content;
      setProducts(productsData);
       setCategories(categoriesData);
       setFilteredProducts(productsData);
     } catch (error) {
       console.error('Failed to load data:', error);
       toast.error('Failed to load data');
     } finally {
       setIsLoading(false);
     }
   };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing && selectedProduct) {
        await apiService.updateProduct(selectedProduct.id, data);
        toast.success('Product updated successfully');
      } else {
        await apiService.createProduct(data);
        toast.success('Product created successfully');
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    form.reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      categoryId: product.categoryId,
      available: product.available ?? true,
      imageUrl: product.imageUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      await apiService.deleteProduct(product.id);
      toast.success('Product deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedProduct(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      categoryId: 0,
      available: true,
      imageUrl: '',
    });
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
    },
    {
      accessorKey: 'category.name',
      header: 'Category',
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return (
          <Badge variant="outline">
            { value }
          </Badge>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.getValue('price') as number;
        return `$${price.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'available',
      header: 'Status',
      cell: ({ row }) => {
        const available = row.getValue('available') as boolean;
        return (
          <Badge variant={available ? 'default' : 'secondary'}>
            {available ? 'Available' : 'Unavailable'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      product &quot;{product.name}&quot;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(product)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
      <AdminLayout>
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">
                  Manage your restaurant menu items and pricing
                </p>
              </div>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter by Category
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategoryFilter === null ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategoryFilter(null)}
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategoryFilter === category.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategoryFilter(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {isEditing ? 'Edit Product' : 'Create Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        rules={{ required: 'Product name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter product description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          rules={{ 
                            required: 'Price is required',
                            min: { value: 0.01, message: 'Price must be greater than 0' }
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="categoryId"
                          rules={{ required: 'Category is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="available"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Available
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Make this product available for orders
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {isEditing ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products List
                {selectedCategoryFilter && (
                  <Badge variant="outline">
                    {getCategoryName(selectedCategoryFilter)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredProducts}
                searchKey="name"
                searchPlaceholder="Search products..."
              />
            </CardContent>
          </Card>
        </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}