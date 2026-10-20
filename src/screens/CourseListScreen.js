import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  ScrollView, // <-- Đã bổ sung ScrollView ở đây
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCourses, getCategories, deleteCourse } from '../services/api';

export default function CourseListScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseData, categoryData] = await Promise.all([
        getCourses(),
        getCategories(),
      ]);
      setCourses(Array.isArray(courseData) ? courseData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}" không?`);
    if (confirmDelete) {
      try {
        await deleteCourse(id);
        alert('Đã xóa khóa học thành công!');
        fetchData();
      } catch (error) {
        alert('Xóa thất bại. Vui lòng thử lại!');
      }
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'ALL' || course?.categoryId === selectedCategory;
    const titleMatch = course?.title ? course.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const instructorMatch = course?.instructor ? course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return matchesCategory && (titleMatch || instructorMatch);
  });

  const renderItem = ({ item }) => {
    const categoryObj = categories.find((cat) => cat.id === item?.categoryId);
    const categoryName = categoryObj?.name || categoryObj?.title || 'Chưa phân loại';

    return (
      <View style={styles.courseCard}>
        <Image
          source={{ uri: item?.thumbnail || 'https://via.placeholder.com/150' }}
          style={styles.thumbnail}
        />
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {item?.title || 'Không có tiêu đề'}
          </Text>
          <Text style={styles.categoryBadge}>{categoryName}</Text>
          <Text style={styles.instructorText}>👨‍🏫 {item?.instructor || 'Đang cập nhật'}</Text>
          <Text style={styles.priceText}>
            💰 {item?.price ? Number(item.price).toLocaleString('vi-VN') : '0'} VNĐ
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnDetail]}
              onPress={() => navigation.navigate('CourseDetail', { course: item })}
            >
              <Text style={styles.btnText}>Chi tiết</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnEdit]}
              onPress={() => navigation.navigate('CourseForm', { course: item })}
            >
              <Text style={styles.btnText}>Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnDelete]}
              onPress={() => handleDelete(item?.id, item?.title)}
            >
              <Text style={styles.btnText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>📚 Quản lý Khóa học</Text>
        <View style={styles.buttonGroupHeader}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CourseForm')}
          >
            <Text style={styles.addButtonText}>➕ Thêm khóa học</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#17a2b8' }]}
            onPress={() => navigation.navigate('CategoryManagement')}
          >
            <Text style={styles.addButtonText}>📂 Quản lý Danh mục</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm theo tên khóa học hoặc giảng viên..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'ALL' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text style={[styles.filterText, selectedCategory === 'ALL' && styles.filterTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat?.id ? String(cat.id) : Math.random().toString()}
              style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.filterText, selectedCategory === cat.id && styles.filterTextActive]}>
                {cat?.name || cat?.title || 'Danh mục'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderItem}
          keyExtractor={(item) => (item?.id ? String(item.id) : Math.random().toString())}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Không tìm thấy khóa học nào!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#212529', marginBottom: 12, textAlign: 'center' },
  buttonGroupHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  addButton: { flex: 1, backgroundColor: '#007AFF', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  filterContainer: { paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#e9ecef', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#dee2e6' },
  filterChipActive: { backgroundColor: '#007AFF', borderColor: '#0056b3' },
  filterText: { color: '#495057', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  listContent: { padding: 16 },
  courseCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 16, flexDirection: 'row', padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
  thumbnail: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#e9ecef' },
  courseInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  courseTitle: { fontSize: 16, fontWeight: 'bold', color: '#212529' },
  categoryBadge: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  instructorText: { fontSize: 13, color: '#6c757d' },
  priceText: { fontSize: 13, color: '#28a745', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 6 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  btnDetail: { backgroundColor: '#6c757d' },
  btnEdit: { backgroundColor: '#ffc107' },
  btnDelete: { backgroundColor: '#dc3545' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  centerContainer: { padding: 40, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6c757d' },
  emptyText: { color: '#6c757d', fontSize: 15, fontStyle: 'italic' },
});