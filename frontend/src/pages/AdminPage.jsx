import { useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import CategoryTable from '../components/admin/CategoryTable';
import OrderTable from '../components/admin/OrderTable';
import ProductEditModal from '../components/admin/ProductEditModal';
import ProductForm from '../components/admin/ProductForm';
import ProductTable from '../components/admin/ProductTable';
import UserTable from '../components/admin/UserTable';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const defaultCategoryDraft = {
  name: '',
  description: ''
};

const validSections = new Set(['dashboard', 'products', 'categories', 'orders', 'users', 'settings']);

function AdminPage() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productDraft, setProductDraft] = useState(ProductForm.initialState);
  const [editingProductDraft, setEditingProductDraft] = useState(ProductForm.initialState);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState(defaultCategoryDraft);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [savingUserId, setSavingUserId] = useState(null);

  const activeSection = validSections.has(searchParams.get('section')) ? searchParams.get('section') : 'dashboard';

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }

    let ignore = false;

    async function loadAdminData() {
      setIsLoading(true);
      setError('');

      try {
        const [productList, categoryList, orderList, userList] = await Promise.all([
          api.getAdminProducts(),
          api.getCategories(),
          api.getAdminOrders(),
          api.getAdminUsers()
        ]);

        if (ignore) {
          return;
        }

        setProducts(productList);
        setCategories(categoryList);
        setOrders(orderList);
        setUsers(userList);
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isAdmin]);

  const stats = useMemo(
    () => ({
      products: products.length,
      categories: categories.length,
      orders: orders.length,
      users: users.length
    }),
    [products.length, categories.length, orders.length, users.length]
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  function changeSection(section) {
    setSearchParams(section === 'dashboard' ? {} : { section });
  }

  function resetMessages() {
    setError('');
    setFeedback('');
  }

  function updateProductDraft(field, value) {
    setProductDraft((current) => ({ ...current, [field]: value }));
  }

  function updateEditingProductDraft(field, value) {
    setEditingProductDraft((current) => ({ ...current, [field]: value }));
  }

  function updateCategoryDraft(field, value) {
    setCategoryDraft((current) => ({ ...current, [field]: value }));
  }

  function startProductEdit(product) {
    resetMessages();
    setEditingProduct(product);
    setEditingProductDraft(ProductForm.normalize(product));
    changeSection('products');
  }

  function cancelProductEdit() {
    setEditingProduct(null);
    setEditingProductDraft(ProductForm.initialState);
  }

  function startCategoryEdit(category) {
    resetMessages();
    setEditingCategoryId(category.id);
    setCategoryDraft({
      name: category.name,
      description: category.description || ''
    });
    changeSection('categories');
  }

  function cancelCategoryEdit() {
    setEditingCategoryId(null);
    setCategoryDraft(defaultCategoryDraft);
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    resetMessages();
    setIsSavingProduct(true);

    const sourceDraft = editingProduct ? editingProductDraft : productDraft;
    const payload = {
      name: sourceDraft.name.trim(),
      description: sourceDraft.description.trim(),
      price: Number(sourceDraft.price),
      categoryId: Number(sourceDraft.categoryId),
      stock: Number(sourceDraft.stock),
      active: Boolean(sourceDraft.active)
    };

    try {
      if (editingProduct) {
        const savedProduct = await api.updateProduct(editingProduct.id, payload);
        const categoryName = categories.find((category) => category.id === savedProduct.categoryId)?.name || savedProduct.categoryName;
        setProducts((current) => current.map((product) => (product.id === editingProduct.id ? { ...savedProduct, categoryName } : product)));
        setFeedback('Produkt wurde aktualisiert.');
      } else {
        const savedProduct = await api.createProduct(payload);
        const categoryName = categories.find((category) => category.id === savedProduct.categoryId)?.name || savedProduct.categoryName;
        setProducts((current) => [{ ...savedProduct, categoryName }, ...current]);
        setFeedback('Produkt wurde erstellt.');
        setProductDraft(ProductForm.initialState);
      }

      if (editingProduct) {
        cancelProductEdit();
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleDeleteProduct(product) {
    resetMessages();

    if (!window.confirm(`Produkt "${product.name}" wirklich löschen?`)) {
      return;
    }

    try {
      await api.deleteProduct(product.id);
      setProducts((current) => current.filter((entry) => entry.id !== product.id));
      if (editingProduct?.id === product.id) {
        cancelProductEdit();
      }
      setFeedback('Produkt wurde gelöscht.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    resetMessages();
    setIsSavingCategory(true);

    const payload = {
      name: categoryDraft.name.trim(),
      description: categoryDraft.description.trim()
    };

    try {
      if (editingCategoryId) {
        const updatedCategory = await api.updateCategory(editingCategoryId, payload);
        setCategories((current) => current.map((category) => (category.id === editingCategoryId ? updatedCategory : category)));
        setProducts((current) =>
          current.map((product) =>
            product.categoryId === editingCategoryId ? { ...product, categoryName: updatedCategory.name } : product
          )
        );
        setFeedback('Kategorie wurde aktualisiert.');
      } else {
        const newCategory = await api.createCategory(payload);
        setCategories((current) => [...current, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
        setFeedback('Kategorie wurde erstellt.');
      }

      cancelCategoryEdit();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleDeleteCategory(category) {
    resetMessages();

    if (!window.confirm(`Kategorie "${category.name}" wirklich löschen?`)) {
      return;
    }

    try {
      await api.deleteCategory(category.id);
      setCategories((current) => current.filter((entry) => entry.id !== category.id));
      if (editingCategoryId === category.id) {
        cancelCategoryEdit();
      }
      setFeedback('Kategorie wurde gelöscht.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleOrderStatusChange(order, status) {
    if (order.status === status) {
      return;
    }

    resetMessages();
    setSavingOrderId(order.id);

    try {
      const updatedOrder = await api.updateAdminOrderStatus(order.id, status);
      setOrders((current) => current.map((entry) => (entry.id === order.id ? { ...entry, ...updatedOrder } : entry)));
      setFeedback(`Bestellstatus fuer Bestellung #${order.id} wurde gespeichert.`);
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setSavingOrderId(null);
    }
  }

  async function handleUserRoleChange(selectedUser, role) {
    if (selectedUser.role === role || selectedUser.id === user?.id) {
      return;
    }

    resetMessages();
    setSavingUserId(selectedUser.id);

    try {
      const updatedUser = await api.updateAdminUserRole(selectedUser.id, role);
      setUsers((current) => current.map((entry) => (entry.id === selectedUser.id ? updatedUser : entry)));
      setFeedback(`Rolle fuer ${selectedUser.firstname} ${selectedUser.lastname} wurde gespeichert.`);
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setSavingUserId(null);
    }
  }

  function renderDashboard() {
    const activeProducts = products.filter((product) => product.active).length;
    const adminUsers = users.filter((entry) => entry.role === 'ADMIN').length;
    const openOrders = orders.filter((entry) => entry.status === 'OPEN').length;

    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Produktstatus</p>
          <h3 className="mt-2 text-2xl font-extrabold text-ink">{activeProducts} aktive Produkte</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {products.length - activeProducts} Produkte sind aktuell inaktiv und nur im Admin sichtbar.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Bestellungen</p>
          <h3 className="mt-2 text-2xl font-extrabold text-ink">{openOrders} offene Bestellungen</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">Alle Bestellungen werden direkt aus dem Backend geladen.</p>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Benutzerrollen</p>
          <h3 className="mt-2 text-2xl font-extrabold text-ink">{adminUsers} Admins</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{users.length - adminUsers} weitere Benutzer haben Kundenrechte.</p>
        </article>
      </div>
    );
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div className="grid gap-6">
          <div className="h-40 animate-pulse rounded-[1.75rem] bg-white shadow-card" />
          <div className="h-96 animate-pulse rounded-[1.75rem] bg-white shadow-card" />
        </div>
      );
    }

    switch (activeSection) {
      case 'products':
        return (
          <div className="grid gap-6">
            <ProductForm
              categories={categories}
              draft={productDraft}
              onChange={updateProductDraft}
              onSubmit={handleProductSubmit}
              onCancel={cancelProductEdit}
              isSaving={isSavingProduct}
              editingProduct={null}
            />
            <ProductTable products={products} onEdit={startProductEdit} onDelete={handleDeleteProduct} />
            <ProductEditModal
              categories={categories}
              draft={editingProductDraft}
              onChange={updateEditingProductDraft}
              onSubmit={handleProductSubmit}
              onClose={cancelProductEdit}
              isSaving={isSavingProduct}
              isOpen={Boolean(editingProduct)}
            />
          </div>
        );
      case 'categories':
        return (
          <CategoryTable
            categories={categories}
            draft={categoryDraft}
            editingCategoryId={editingCategoryId}
            onChange={updateCategoryDraft}
            onEdit={startCategoryEdit}
            onCancelEdit={cancelCategoryEdit}
            onSubmit={handleCategorySubmit}
            onDelete={handleDeleteCategory}
            isSaving={isSavingCategory}
          />
        );
      case 'orders':
        return <OrderTable orders={orders} onStatusChange={handleOrderStatusChange} savingOrderId={savingOrderId} />;
      case 'users':
        return <UserTable users={users} currentUserId={user?.id} onRoleChange={handleUserRoleChange} savingUserId={savingUserId} />;
      case 'settings':
        return (
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Einstellungen</p>
            <h3 className="mt-2 text-2xl font-extrabold text-ink">Admin Hinweise</h3>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Rollenänderungen und weitere Systemkonfigurationen sind im aktuellen Backend nicht exponiert. Das Panel nutzt nur reale, verfügbare API-Funktionen.
            </p>
          </div>
        );
      case 'dashboard':
      default:
        return renderDashboard();
    }
  }

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={changeSection} user={user} stats={stats}>
      {error ? <div className="mb-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
      {feedback ? <div className="mb-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{feedback}</div> : null}
      {renderContent()}
    </AdminLayout>
  );
}

export default AdminPage;
