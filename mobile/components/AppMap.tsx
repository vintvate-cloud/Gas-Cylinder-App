import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../constants/Colors';

export interface DeliveryPin {
    id: string;
    coordinate: { latitude: number; longitude: number };
    customerName: string;
    status: string;
}

interface AppMapProps {
    mapRef: any;
    driverLoc: { latitude: number, longitude: number } | null;
    destinationLoc: { latitude: number, longitude: number } | null;
    routeCoords: any[];
    deliveryPins?: DeliveryPin[];
    onMapReady?: () => void;
}

export const AppMap: React.FC<AppMapProps> = ({ mapRef, driverLoc, destinationLoc, routeCoords, deliveryPins = [], onMapReady }) => {
    return (
        <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            onMapReady={onMapReady}
            showsUserLocation={false}
            initialRegion={{
                latitude: driverLoc?.latitude || destinationLoc?.latitude || 20.5937,
                longitude: driverLoc?.longitude || destinationLoc?.longitude || 78.9629,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
        >
            {/* Driver live location */}
            {driverLoc && (
                <Marker key="driver-marker" coordinate={driverLoc} title="Your Location">
                    <View style={styles.driverMarker}>
                        <Ionicons name="car-sport" size={20} color="white" />
                    </View>
                </Marker>
            )}

            {/* All delivery pins */}
            {deliveryPins.map((pin) => {
                const isActive = pin.status === 'OUT_FOR_DELIVERY';
                const isDelivered = pin.status === 'DELIVERED';
                return (
                    <Marker
                        key={`pin-${pin.id}`}
                        coordinate={pin.coordinate}
                        title={pin.customerName}
                        description={pin.status.replace('_', ' ')}
                    >
                        <View style={[
                            styles.deliveryPin,
                            isActive && styles.activePinBg,
                            isDelivered && styles.deliveredPinBg,
                        ]}>
                            <Ionicons name="location" size={18} color="white" />
                            {isActive && (
                                <View style={styles.activeDot} />
                            )}
                        </View>
                    </Marker>
                );
            })}

            {/* Route polyline to active destination */}
            {routeCoords.length > 0 && (
                <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={Colors.primary} />
            )}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: { ...StyleSheet.absoluteFillObject },
    driverMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
        elevation: 5,
    },
    deliveryPin: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f43f5e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        borderColor: 'white',
        elevation: 5,
    },
    activePinBg: {
        backgroundColor: '#F97316',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    deliveredPinBg: {
        backgroundColor: '#10B981',
    },
    activeDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FACC15',
        borderWidth: 1.5,
        borderColor: 'white',
    },
});
