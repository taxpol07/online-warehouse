"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/auth";

// 1. ADIM: TypeScript Interface
interface Equipment {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  dimensions: string;
  power_requirements: string;
  status: "available" | "sold";
  image_urls: string[]; 
}

// RESİM DÜZELTİCİ FONKSİYON
const parseImageUrls = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

export default function DashboardPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false); // YENİ: Yükleme durumu
  const [searchQuery, setSearchQuery] = useState(""); // YENİ: Arama durumu

  // ADD FORM STATES
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [powerRequirements, setPowerRequirements] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  // EDIT STATES
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [editDimensions, setEditDimensions] = useState("");
  const [editPowerRequirements, setEditPowerRequirements] = useState("");
  const [editImages, setEditImages] = useState<FileList | null>(null); // YENİ: Edit için resim

  const fetchData = async () => {
    const { data } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    setItems(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // YENİ: Dinamik Upload Fonksiyonu (Hem Add hem Edit için kullanılır)
  const uploadImages = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return [];
    const urls: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, "")}`;

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, file);

      if (uploadError) {
        alert(`Fotoğraf yüklenemedi: ${uploadError.message}`);
        console.error("Detaylı Supabase Hatası:", uploadError);
      } else {
        const { data } = supabase.storage
          .from("equipment-images")
          .getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };                                 

  const addEquipment = async () => {
    setLoading(true);
    const imageUrls = await uploadImages(images);

    const { error } = await supabase.from("equipment").insert([
      {
        title,
        brand,
        model,
        price: Number(price),
        description,
        category,
        condition,
        dimensions,
        power_requirements: powerRequirements,
        status: "available",
        image_urls: imageUrls,
      },
    ]);

    if (error) {
      alert("Hata oluştu: " + error.message);
    } else {
      // Formu temizle
      setTitle(""); setBrand(""); setModel(""); setPrice(""); setDescription("");
      setCategory(""); setCondition(""); setDimensions(""); setPowerRequirements(""); setImages(null);
      fetchData();
    }
    setLoading(false);
  };

  const deleteEquipment = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      await supabase.from("equipment").delete().eq("id", id);
      fetchData();
    }
  };

  const openEdit = (item: Equipment) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditBrand(item.brand || "");
    setEditModel(item.model || "");
    setEditPrice(item.price ? item.price.toString() : "");
    setEditDescription(item.description || "");
    setEditCategory(item.category || "");
    setEditCondition(item.condition || "");
    setEditDimensions(item.dimensions || "");
    setEditPowerRequirements(item.power_requirements || "");
    setEditImages(null);
  };

  const updateEquipment = async () => {
    if (!editingItem) return;
    setLoading(true);

    // Varsayılan olarak eski resimleri koru
    let finalUrls = editingItem.image_urls;

    // Eğer edit modunda yeni resim seçildiyse onları yükle ve eskilerin yerine geçir
    if (editImages && editImages.length > 0) {
      finalUrls = await uploadImages(editImages);
    }

    const { error } = await supabase
      .from("equipment")
      .update({
        title: editTitle,
        brand: editBrand,
        model: editModel,
        price: Number(editPrice),
        description: editDescription,
        category: editCategory,
        condition: editCondition,
        dimensions: editDimensions,
        power_requirements: editPowerRequirements,
        image_urls: finalUrls // Güncellenmiş resimleri gönder
      })
      .eq("id", editingItem.id);

    if (error) {
       alert("Güncelleme hatası: " + error.message);
    } else {
       setEditingItem(null);
       fetchData();
    }
    setLoading(false);
  };    

  const toggleStatus = async (item: Equipment) => {
    const newStatus = item.status === "available" ? "sold" : "available";
    await supabase.from("equipment").update({ status: newStatus }).eq("id", item.id);
    fetchData();
  };

  // YENİ: Arama filtresi
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight flex items-center gap-3">
              Keser Machinery 
              <span className="text-white text-2xl">| Admin</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Manage your commercial catering equipment inventory securely.
            </p>
          </div>
          <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-slate-700 shadow-lg">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Developed By</span>
            <span className="text-sm font-bold text-blue-400">Polat Can Keser</span>
          </div>
        </div>

        {/* ADD FORM CARD */}
        <div className="bg-[#1e293b] shadow-xl rounded-2xl p-6 md:p-8 mb-10 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-lg">➕</span>
            Add New Equipment
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <input className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="Product Title (e.g., Lincat Fryer)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="Category (e.g., Ovens, Fryers)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            <input className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
            <input className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="Condition (e.g., Refurbished, Like New)" value={condition} onChange={(e) => setCondition(e.target.value)} />
            <input className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="Dimensions (e.g., 600w x 600d x 900h mm)" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
            <input className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="Power Req. (e.g., 3-Phase 32A, Natural Gas)" value={powerRequirements} onChange={(e) => setPowerRequirements(e.target.value)} />
            <input type="number" className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all" placeholder="Price (£)" value={price} onChange={(e) => setPrice(e.target.value)} />

            <textarea className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl md:col-span-2 min-h-[120px] focus:outline-none focus:border-blue-500 transition-all" placeholder="Detailed Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Upload Product Images</label>
              <input type="file" multiple accept="image/*" className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all border border-slate-700 rounded-xl bg-[#0f172a]" onChange={(e) => setImages(e.target.files)} />
            </div>
          </div>

          <button onClick={addEquipment} disabled={loading} className="mt-6 w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-500 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:-translate-y-0 disabled:cursor-not-allowed">
            {loading ? "Processing..." : "Save Equipment to Database"}
          </button>
        </div>

        {/* INVENTORY LIST HEADER WITH SEARCH */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
           <h2 className="text-xl font-bold text-white">Current Inventory ({filteredItems.length})</h2>
           <input 
              type="text" 
              placeholder="Search equipment..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#1e293b] border border-slate-700 text-white placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
           />
        </div>

        {/* INVENTORY LIST */}
        <div className="grid gap-4">
          {filteredItems.map((item) => {
            const safeImages = parseImageUrls(item.image_urls);
            const displayImage = safeImages[0] || "/placeholder.png";

            return (
              <div key={item.id} className="bg-[#1e293b] border border-slate-700 shadow-md rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-500 transition-colors">
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <div className="w-20 h-20 bg-[#0f172a] rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                    <img src={displayImage} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-100 text-lg line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{item.brand || "Unbranded"} {item.model ? `• ${item.model}` : ""}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">{item.category || "Uncategorized"}</span>
                      <span className="font-bold text-blue-400">£{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-700 pt-3 md:pt-0">
                  <button onClick={() => toggleStatus(item)} className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${item.status === "available" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"}`}>
                    {item.status.toUpperCase()}
                  </button>

                  <button onClick={() => openEdit(item)} className="px-4 py-2 text-xs font-bold bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                    Edit
                  </button>

                  <button onClick={() => deleteEquipment(item.id)} className="px-4 py-2 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-[#1e293b] border border-slate-700 rounded-xl">
              <p className="text-slate-400">{searchQuery ? "No results found for your search." : "No equipment found. Add your first item above."}</p>
            </div>
          )}
        </div>

        {/* EDIT MODAL */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-[#1e293b] border border-slate-700 p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl my-8">
              <h2 className="text-xl font-bold text-white mb-6">Edit Equipment</h2>

              <div className="space-y-3">
                <input className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Brand" value={editBrand} onChange={(e) => setEditBrand(e.target.value)} />
                  <input className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Model" value={editModel} onChange={(e) => setEditModel(e.target.value)} />
                </div>
                <input className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Dimensions" value={editDimensions} onChange={(e) => setEditDimensions(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Condition" value={editCondition} onChange={(e) => setEditCondition(e.target.value)} />
                  <input className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Power Req." value={editPowerRequirements} onChange={(e) => setEditPowerRequirements(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Price" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <input className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                </div>
                <textarea className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg min-h-[100px] focus:outline-none focus:border-blue-500" placeholder="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                
                {/* YENİ: Edit Modunda Resim Yükleme Alanı */}
                <div className="mt-2 p-3 bg-[#0f172a] border border-slate-700 rounded-lg">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Update Images (Optional)</label>
                  <input type="file" multiple accept="image/*" className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all" onChange={(e) => setEditImages(e.target.files)} />
                  
                  {/* Eski resimlerin küçük bir önizlemesi */}
                  {!editImages && editingItem.image_urls && parseImageUrls(editingItem.image_urls).length > 0 && (
                     <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {parseImageUrls(editingItem.image_urls).map((img, idx) => (
                           <img key={idx} src={img} className="w-12 h-12 object-cover rounded border border-slate-600" alt="Current" />
                        ))}
                     </div>
                  )}
                  <p className="text-[10px] text-slate-500 mt-2">If you select new images, they will replace the current ones.</p>
                </div>

              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={updateEquipment} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 transition-colors disabled:opacity-50">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setEditingItem(null)} disabled={loading} className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}