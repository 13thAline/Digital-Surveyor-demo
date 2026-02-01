import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../styles';

const { width, height } = Dimensions.get('window');
const BOX_SIZE = width * 0.8;
const BOX_TOP = height * 0.25;

export function CaptureOverlay() {
    return (
        <View style={styles.container} pointerEvents="none">
            {/* Dark overlay with cutout */}
            <View style={styles.overlay}>
                {/* Top section */}
                <View style={[styles.darkSection, { height: BOX_TOP }]} />

                {/* Middle section with cutout */}
                <View style={styles.middleSection}>
                    <View style={styles.darkSection} />
                    <View style={styles.cutout}>
                        {/* Corner brackets */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.darkSection} />
                </View>

                {/* Bottom section */}
                <View style={styles.darkSection} />
            </View>

            {/* Instructions */}
            <View style={styles.instructionContainer}>
                <Text style={styles.instructionTitle}>Position the damage</Text>
                <Text style={styles.instructionText}>
                    Align the vehicle damage within the frame
                </Text>
            </View>
        </View>
    );
}

const CORNER_SIZE = 40;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        flex: 1,
    },
    darkSection: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
    },
    middleSection: {
        height: BOX_SIZE,
        flexDirection: 'row',
    },
    cutout: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: theme.colors.greenBox,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderTopLeftRadius: theme.borderRadius.md,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderTopRightRadius: theme.borderRadius.md,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderBottomLeftRadius: theme.borderRadius.md,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderBottomRightRadius: theme.borderRadius.md,
    },
    instructionContainer: {
        position: 'absolute',
        bottom: 140,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    instructionTitle: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    instructionText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});
