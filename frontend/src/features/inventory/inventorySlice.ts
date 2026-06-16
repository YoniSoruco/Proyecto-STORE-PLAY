import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/api/products';
import * as categoryApi from '@/api/categories';
import * as supplierApi from '@/api/suppliers';
import type { Product, Batch } from '@/api/products';
import type { Category } from '@/api/categories';
import type { Supplier } from '@/api/suppliers';

export interface InventoryState {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  batches: Record<number, Batch[]>; // productId -> Batch[]
  allBatches: Batch[];
  dashboard: api.InventoryDashboard | null;
  loading: boolean;
  error: string | null;
  searchResult: Product | null;
}

const initialState: InventoryState = {
  products: [],
  categories: [],
  suppliers: [],
  batches: {},
  allBatches: [],
  dashboard: null,
  loading: false,
  error: null,
  searchResult: null,
};

export const fetchProducts = createAsyncThunk(
  'inventory/fetchProducts',
  async () => {
    return await api.getProducts();
  }
);

export const fetchCategories = createAsyncThunk(
  'inventory/fetchCategories',
  async () => {
    return await categoryApi.getCategories();
  }
);

export const createCategory = createAsyncThunk(
  'inventory/createCategory',
  async (name: string) => {
    return await categoryApi.createCategory(name);
  }
);

export const addProduct = createAsyncThunk(
  'inventory/addProduct',
  async (product: api.CreateProductRequest) => {
    return await api.createProduct(product);
  }
);

export const searchProductByBarcode = createAsyncThunk(
  'inventory/searchProductByBarcode',
  async (barcode: string) => {
    return await api.getProductByBarcode(barcode);
  }
);

export const removeProduct = createAsyncThunk(
  'inventory/removeProduct',
  async (id: number) => {
    await api.deleteProduct(id);
    return id;
  }
);

export const updateExistingProduct = createAsyncThunk(
  'inventory/updateExistingProduct',
  async ({ id, data }: { id: number; data: api.CreateProductRequest }) => {
    return await api.updateProduct(id, data);
  }
);

export const fetchBatches = createAsyncThunk(
  'inventory/fetchBatches',
  async (productId: number) => {
    const batches = await api.getBatches(productId);
    return { productId, batches };
  }
);

export const fetchAllBatches = createAsyncThunk(
  'inventory/fetchAllBatches',
  async () => {
    return await api.getAllBatches();
  }
);

export const addBatchToProduct = createAsyncThunk(
  'inventory/addBatchToProduct',
  async ({ productId, data }: { productId: number; data: api.CreateBatchRequest }) => {
    return await api.addBatch(productId, data);
  }
);

export const fetchInventoryDashboard = createAsyncThunk(
  'inventory/fetchDashboard',
  async () => {
    return await api.getDashboardData();
  }
);

export const fetchSuppliers = createAsyncThunk(
  'inventory/fetchSuppliers',
  async () => {
    return await supplierApi.getSuppliers();
  }
);

export const addSupplierToStore = createAsyncThunk(
  'inventory/addSupplier',
  async (data: supplierApi.CreateSupplierRequest) => {
    return await supplierApi.createSupplier(data);
  }
);

export const removeSupplier = createAsyncThunk(
  'inventory/removeSupplier',
  async (id: number) => {
    await supplierApi.deleteSupplier(id);
    return id;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar productos';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al agregar producto';
      })
      .addCase(searchProductByBarcode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.searchResult = null;
      })
      .addCase(searchProductByBarcode.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResult = action.payload;
      })
      .addCase(searchProductByBarcode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Producto no encontrado';
      })
      .addCase(removeProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar producto';
      })
      .addCase(updateExistingProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(updateExistingProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar producto';
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.batches[action.payload.productId] = action.payload.batches;
      })
      .addCase(fetchAllBatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.allBatches = action.payload;
      })
      .addCase(addBatchToProduct.fulfilled, (state, action) => {
        const productId = action.payload.productId;
        if (!state.batches[productId]) state.batches[productId] = [];
        state.batches[productId].push(action.payload);
        state.allBatches.push(action.payload);
        
        // Actualizar totalStock del producto localmente
        const product = state.products.find(p => p.id === productId);
        if (product) {
          product.totalStock += action.payload.stock;
        }
      })
      .addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      .addCase(addSupplierToStore.fulfilled, (state, action) => {
        state.suppliers.push(action.payload);
      })
      .addCase(removeSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
      });
  },
});

export default inventorySlice.reducer;
