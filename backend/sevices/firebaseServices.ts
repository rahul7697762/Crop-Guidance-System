import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
  import { db, storage } from '../../backend/firebase/config';
  
  // Interfaces
  export interface SoilTestRecord {
    id?: string;
    userId: string;
    testDate: Date;
    location: {
      latitude?: number;
      longitude?: number;
      address: string;
    };
    results: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      ph: number;
      organicMatter: number;
      moisture: number;
    };
    recommendations: string[];
    createdAt: Date;
  }
  
  export interface CropRecord {
    id?: string;
    userId: string;
    cropName: string;
    variety: string;
    plantingDate: Date;
    expectedHarvestDate: Date;
    actualHarvestDate?: Date;
    area: number; // in acres
    location: string;
    season: 'kharif' | 'rabi' | 'zaid';
    status: 'planned' | 'planted' | 'growing' | 'harvested';
    yieldExpected: number;
    yieldActual?: number;
    profitMargin?: number;
    notes: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface MarketPriceAlert {
    id?: string;
    userId: string;
    cropName: string;
    targetPrice: number;
    currentPrice: number;
    market: string;
    alertType: 'above' | 'below';
    isActive: boolean;
    createdAt: Date;
  }
  
  export interface WeatherAlert {
    id?: string;
    userId: string;
    location: string;
    alertType: 'rain' | 'temperature' | 'humidity' | 'wind';
    threshold: number;
    isActive: boolean;
    createdAt: Date;
  }
  
  // Soil Test Services
  export class SoilTestService {
    static async saveSoilTest(soilTest: Omit<SoilTestRecord, 'id' | 'createdAt'>): Promise<string> {
      const docRef = await addDoc(collection(db, 'soilTests'), {
        ...soilTest,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  
    static async getSoilTests(userId: string, limitCount = 10): Promise<SoilTestRecord[]> {
      const q = query(
        collection(db, 'soilTests'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        testDate: doc.data().testDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as SoilTestRecord[];
    }
  
    static async getSoilTest(testId: string): Promise<SoilTestRecord | null> {
      const docRef = doc(db, 'soilTests', testId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          testDate: docSnap.data().testDate.toDate(),
          createdAt: docSnap.data().createdAt.toDate()
        } as SoilTestRecord;
      }
      return null;
    }
  }
  
  // Crop Management Services
  export class CropService {
    static async addCrop(crop: Omit<CropRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
      const docRef = await addDoc(collection(db, 'crops'), {
        ...crop,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    }
  
    static async updateCrop(cropId: string, updates: Partial<CropRecord>): Promise<void> {
      const docRef = doc(db, 'crops', cropId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }
  
    static async getCrops(userId: string): Promise<CropRecord[]> {
      const q = query(
        collection(db, 'crops'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        plantingDate: doc.data().plantingDate.toDate(),
        expectedHarvestDate: doc.data().expectedHarvestDate.toDate(),
        actualHarvestDate: doc.data().actualHarvestDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as CropRecord[];
    }
  
    static async getCropsByStatus(userId: string, status: CropRecord['status']): Promise<CropRecord[]> {
      const q = query(
        collection(db, 'crops'),
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        plantingDate: doc.data().plantingDate.toDate(),
        expectedHarvestDate: doc.data().expectedHarvestDate.toDate(),
        actualHarvestDate: doc.data().actualHarvestDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as CropRecord[];
    }
  
    static async deleteCrop(cropId: string): Promise<void> {
      await deleteDoc(doc(db, 'crops', cropId));
    }
  }
  
  // File Upload Services
  export class FileUploadService {
    static async uploadImage(file: File, path: string): Promise<string> {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    }
  
    static async deleteImage(imagePath: string): Promise<void> {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    }
  
    static async uploadMultipleImages(files: File[], basePath: string): Promise<string[]> {
      const uploadPromises = files.map((file, index) => {
        const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
        return this.uploadImage(file, path);
      });
      
      return Promise.all(uploadPromises);
    }
  }
  
  // Alert Services
  export class AlertService {
    static async createPriceAlert(alert: Omit<MarketPriceAlert, 'id' | 'createdAt'>): Promise<string> {
      const docRef = await addDoc(collection(db, 'priceAlerts'), {
        ...alert,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  
    static async getPriceAlerts(userId: string): Promise<MarketPriceAlert[]> {
      const q = query(
        collection(db, 'priceAlerts'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as MarketPriceAlert[];
    }
  
    static async updatePriceAlert(alertId: string, updates: Partial<MarketPriceAlert>): Promise<void> {
      const docRef = doc(db, 'priceAlerts', alertId);
      await updateDoc(docRef, updates);
    }
  
    static async createWeatherAlert(alert: Omit<WeatherAlert, 'id' | 'createdAt'>): Promise<string> {
      const docRef = await addDoc(collection(db, 'weatherAlerts'), {
        ...alert,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  
    static async getWeatherAlerts(userId: string): Promise<WeatherAlert[]> {
      const q = query(
        collection(db, 'weatherAlerts'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as WeatherAlert[];
    }
  }
  
  // Analytics Services
  export class AnalyticsService {
    static async getCropPerformanceStats(userId: string): Promise<any> {
      const crops = await CropService.getCrops(userId);
      const harvestedCrops = crops.filter(crop => crop.status === 'harvested');
      
      if (harvestedCrops.length === 0) {
        return {
          totalCrops: crops.length,
          harvestedCrops: 0,
          averageYield: 0,
          totalRevenue: 0,
          profitableSeasons: []
        };
      }
  
      const totalRevenue = harvestedCrops.reduce((sum, crop) => {
        return sum + (crop.yieldActual || 0) * (crop.profitMargin || 0);
      }, 0);
  
      const averageYield = harvestedCrops.reduce((sum, crop) => {
        return sum + (crop.yieldActual || 0);
      }, 0) / harvestedCrops.length;
  
      // Group by seasons
      const seasonStats = harvestedCrops.reduce((acc, crop) => {
        if (!acc[crop.season]) {
          acc[crop.season] = { count: 0, totalYield: 0, totalProfit: 0 };
        }
        acc[crop.season].count++;
        acc[crop.season].totalYield += crop.yieldActual || 0;
        acc[crop.season].totalProfit += (crop.yieldActual || 0) * (crop.profitMargin || 0);
        return acc;
      }, {} as any);
  
      return {
        totalCrops: crops.length,
        harvestedCrops: harvestedCrops.length,
        averageYield,
        totalRevenue,
        seasonStats,
        profitableSeasons: Object.keys(seasonStats).sort((a, b) => 
          seasonStats[b].totalProfit - seasonStats[a].totalProfit
        )
      };
    }
  
    static async getSoilHealthTrends(userId: string): Promise<any> {
      const soilTests = await SoilTestService.getSoilTests(userId, 50);
      
      if (soilTests.length === 0) {
        return { trends: [], recommendations: [] };
      }
  
      // Calculate trends for key parameters
      const trends = ['nitrogen', 'phosphorus', 'potassium', 'ph'].map(param => {
        const values = soilTests.map(test => test.results[param as keyof typeof test.results]);
        const latest = values[0];
        const previous = values[values.length - 1];
        const trend = latest > previous ? 'improving' : latest < previous ? 'declining' : 'stable';
        
        return {
          parameter: param,
          current: latest,
          trend,
          values: values.slice(0, 10) // Last 10 tests
        };
      });
  
      return { trends, testCount: soilTests.length };
    }
  }