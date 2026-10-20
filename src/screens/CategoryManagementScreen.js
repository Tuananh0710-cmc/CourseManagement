import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCategories, addCategory, deleteCategory, getCourses } from '../services/api';

export default function CategoryManagementScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoryData, courseData] = await Promise.all([
        getCategories(),
        getCourses(),
      ]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu danh mục:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      setLoading(true);
      await addCategory({ name: categoryName.trim() });
      setCategoryName('');
      alert('Thêm danh mục thành công!');
      fetchData();
    } catch (error) {
      alert('Thêm danh mục thất bại. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    // Kiểm tra ràng buộc toàn vẹn: Chặn xóa nếu còn khóa học liên kết
    const hasCourses = courses.some((course) => course?.categoryId === catId);
    if (hasCourses) {
      alert(`Không thể xóa danh mục "${catName}" vì vẫn còn khóa học liên kết!`);
      return;
    }

    const confirmDelete = window.confirm(`Bạn có chắc muốn xóa danh mục "${catName}" không?`);
    if (confirmDelete) {
      try {
        setLoading(true);
        await deleteCategory(catId);
        alert('Xóa danh mục thành công!');
        fetchData();
      } catch (error) {
        alert('Xóa thất bại. Vui lòng thử lại!');
        setLoading(false);
      }
    }
  };

  const renderItem = ({ item }) => {
    const name = item?.name || item?.title || item?.categoryName || 'Không có tên';
    return (
      <View style={styles.categoryItem}>
        <Text style={styles.categoryText}>📂 {name}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCategory(item?.id, name)}
        >
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Nút Quay lại */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>⬅ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Danh mục</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Form thêm danh mục */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên danh mục mới..."
          value={categoryName}
          onChangeText={setCategoryName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Text style={styles.addButtonText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách danh mục */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => (item?.id ? String(item.id) : Math.random().toString())}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Chưa có danh mục nào!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  backText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#212529' },
  formContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', marginBottom: 10, gap: 10 },
  input: { flex: 1, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  addButton: { backgroundColor: '#28a745', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  listContent: { padding: 16 },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#dee2e6' },
  categoryText: { fontSize: 16, fontWeight: '500', color: '#212529' },
  deleteButton: { backgroundColor: '#dc3545', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  deleteButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  centerContainer: { padding: 40, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6c757d' },
  emptyText: { color: '#6c757d', fontSize: 15, fontStyle: 'italic' },
});