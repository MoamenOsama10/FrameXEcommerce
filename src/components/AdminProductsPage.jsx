import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, ImagePlus, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { API_URL } from "../config";

const AVAILABLE_SIZES = ["20x30", "30x40", "40x50"];

// اسم المقاس اللي راجع من الـ API (Small/Medium/Large) بالشكل اللي الفورم بيستخدمه
const SIZE_FROM_ENUM = { Small: "20x30", Medium: "30x40", Large: "40x50" };

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  basePrice: "",
  sizes: [],
  sizePrices: {},
  isCustomizable: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // الـ Categories المفتوحة، والـ Category اللي الفورم ظاهر جواها
  const [openIds, setOpenIds] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products?pageSize=100`);
    const data = await res.json();
    setProducts(data.items || []);
  };

  useEffect(() => {
    fetchProducts();
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data || []));
  }, []);

  // ===== تجميع المنتجات حسب الـ Category =====
  const groups = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: products.filter((p) => p.categoryName === cat.name),
  }));

  // منتجات مش لاقيين لها Category (عشان مفيش منتج يختفي)
  const orphanProducts = products.filter(
    (p) => !categories.some((c) => c.name === p.categoryName)
  );
  if (orphanProducts.length > 0) {
    groups.push({ id: "uncategorized", name: "بدون تصنيف", items: orphanProducts });
  }

  const toggleCategory = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleSize = (size) => {
    setForm((prev) => {
      const isSelected = prev.sizes.includes(size);
      const newSizes = isSelected
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];

      const newSizePrices = { ...prev.sizePrices };
      if (isSelected) {
        delete newSizePrices[size];
      } else if (!newSizePrices[size]) {
        newSizePrices[size] = "";
      }

      return { ...prev, sizes: newSizes, sizePrices: newSizePrices };
    });
  };

  const handleSizePriceChange = (size, price) => {
    setForm((prev) => ({
      ...prev,
      sizePrices: { ...prev.sizePrices, [size]: price },
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    handleRemoveImage();
    setEditingId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setActiveCategoryId(null);
    resetForm();
  };

  // زر Add Product جوه الـ Category
  const handleAdd = (categoryId) => {
    resetForm();
    setForm({ ...EMPTY_FORM, categoryId });
    setActiveCategoryId(categoryId);
    setShowForm(true);
    setOpenIds((prev) => (prev.includes(categoryId) ? prev : [...prev, categoryId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalBasePrice = parseFloat(form.basePrice);

    if (isNaN(finalBasePrice) || !form.basePrice) {
      if (form.sizePrices && form.sizePrices["30x40"]) {
        finalBasePrice = parseFloat(form.sizePrices["30x40"]);
      } else if (form.sizePrices && Object.keys(form.sizePrices).length > 0) {
        const firstSize = Object.keys(form.sizePrices)[0];
        finalBasePrice = parseFloat(form.sizePrices[firstSize]);
      } else {
        alert("من فضلك أدخل السعر الأساسي، أو اختار مقاس واكتب سعره.");
        return;
      }
    }

    const body = {
      name: form.name,
      description: "",
      categoryId: form.categoryId,
      gender: 0,
      frameShape: 0,
      material: 0,
      basePrice: finalBasePrice,
      isNew: false,
      isOnSale: false,
      sizes: form.sizes,
      sizePrices: form.sizePrices,
      isCustomizable: form.isCustomizable,
    };

    let productId = editingId;

    if (editingId) {
      body.id = editingId;
      await fetch(`${API_URL}/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
      });
    } else {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      productId = data.id || data;
    }

    if (imageFile && productId) {
      const formData = new FormData();
      formData.append("file", imageFile);
      await fetch(`${API_URL}/products/${productId}/image`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
    }

    closeForm();
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    setDeletingId(id);

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (res.ok) {
        fetchProducts();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || errorData.message || "حدث خطأ أثناء الحذف.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("تعذر الاتصال بالسيرفر. تأكد من اتصالك بالإنترنت.");
    } finally {
      setDeletingId(null);
    }
  };

  // بنجيب تفاصيل المنتج من الـ API عشان المقاسات والأسعار والعلامة تتملي صح
  // (الـ Category بتتاخد من الـ Box اللي المنتج جواها لأن الـ API مش بيرجّع categoryId)
  const handleEdit = async (product, categoryId) => {
    let detail = product;
    try {
      const res = await fetch(`${API_URL}/products/${product.id}`);
      if (res.ok) detail = await res.json();
    } catch {
      // نكمل بالبيانات اللي عندنا
    }

    const sizes = [];
    const sizePrices = {};
    (detail.variants || []).forEach((v) => {
      const label = SIZE_FROM_ENUM[v.size];
      if (label && !sizes.includes(label)) {
        sizes.push(label);
        sizePrices[label] = v.price;
      }
    });

    setForm({
      name: detail.name,
      categoryId: categoryId === "uncategorized" ? "" : categoryId,
      basePrice: detail.basePrice,
      sizes,
      sizePrices,
      isCustomizable: !!detail.isCustomizable,
    });
    setImagePreview(
      detail.imageUrl ? `${API_URL.replace("/api", "")}${detail.imageUrl}` : null
    );
    setEditingId(product.id);
    setActiveCategoryId(categoryId);
    setShowForm(true);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-6 space-y-4 max-w-md bg-white">
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" />

      <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm">
        <option value="">اختر الفئة</option>
        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </select>

      <input
        type="number"
        placeholder="Base Price (السعر الأساسي - اختياري)"
        value={form.basePrice}
        onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
      />

      <div>
        <label className="block text-xs font-medium mb-2">المقاسات والأسعار</label>
        <div className="space-y-3">
          {AVAILABLE_SIZES.map((size) => (
            <div key={size} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 text-xs font-medium rounded-md border transition-colors w-24 ${
                  form.sizes.includes(size) ? "bg-black text-white border-black" : "border-gray-200 text-text hover:border-gray-400"
                }`}
              >
                {size} سم
              </button>

              {form.sizes.includes(size) && (
                <input
                  required
                  type="number"
                  placeholder="السعر"
                  value={form.sizePrices[size] || ""}
                  onChange={(e) => handleSizePriceChange(size, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isCustomizable}
          onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium">منتج مخصص (العميل يرفع صورته)</span>
          <span className="block text-xs text-gray-500 mt-1">
            هتظهر للعميل خانة رفع صورة في صفحة المنتج، ومينفعش يشتريه من غير صورة.
          </span>
        </span>
      </label>

      <div>
        <label className="block text-xs font-medium mb-2">Product Image</label>
        {!imagePreview ? (
          <label htmlFor="product-image" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl h-40 cursor-pointer hover:border-accent transition-colors text-muted">
            <ImagePlus size={24} strokeWidth={1.5} />
            <span className="text-xs">اختر صورة</span>
          </label>
        ) : (
          <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
        <input ref={fileInputRef} id="product-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium">
          {editingId ? "Update" : "Create"}
        </button>
        <button type="button" onClick={closeForm} className="border border-gray-200 px-4 py-2 rounded-md text-sm">
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Products</h1>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted">لا توجد تصنيفات بعد. أضف تصنيفاً من صفحة Categories أولاً.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isOpen = openIds.includes(group.id);

            return (
              <div key={group.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(group.id)}
                  className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{group.name}</span>
                    <span className="text-xs text-muted">{group.items.length} منتج</span>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isOpen && (
                  <div className="p-4 space-y-4">
                    {group.id !== "uncategorized" && (
                      <button
                        type="button"
                        onClick={() => handleAdd(group.id)}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        <Plus size={16} /> Add Product
                      </button>
                    )}

                    {showForm && activeCategoryId === group.id && renderForm()}

                    {group.items.length === 0 ? (
                      <p className="text-sm text-muted">لا توجد منتجات في هذا التصنيف.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                          <tr>
                            <th className="px-4 py-3">Image</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((p) => (
                            <tr key={p.id} className="border-t border-gray-100">
                              <td className="px-4 py-3">
                                <div className="w-12 h-12 rounded-lg bg-surface overflow-hidden">
                                  {p.imageUrl && <img src={`${API_URL.replace("/api", "")}${p.imageUrl}`} alt={p.name} className="w-full h-full object-cover" />}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {p.name}
                                {p.isCustomizable && (
                                  <span className="ml-2 text-[10px] font-semibold bg-orange-100 text-orange-800 rounded-full px-2 py-0.5">
                                    مخصص
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">{p.basePrice} EGP</td>
                              <td className="px-4 py-3 flex gap-3 items-center">
                                <button onClick={() => handleEdit(p, group.id)} className="text-muted hover:text-black"><Pencil size={16} /></button>

                                <button
                                  onClick={() => handleDelete(p.id)}
                                  disabled={deletingId === p.id}
                                  className={`text-muted hover:text-red-600 transition-colors ${deletingId === p.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  {deletingId === p.id ? (
                                    <Loader2 size={16} className="animate-spin text-red-600" />
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}