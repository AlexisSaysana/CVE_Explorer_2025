// src/ui/components/CveInput.jsx

import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function CveInput({ cveId, setCveId, onAnalyze, loading }) {
  // Vérifie si l'input est suffisamment long pour être analysé
  const isDisabled = loading || cveId.length < 5;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Entrez un ID CVE (ex: CVE-2024-XXXX)"
        value={cveId}
        onChangeText={setCveId}
        autoCapitalize="none"
        editable={!loading}
        // Permet de lancer l'analyse en appuyant sur Entrée
        onSubmitEditing={onAnalyze} 
      />
      <Button
        title={loading ? "Analyse..." : "Analyser"}
        onPress={onAnalyze}
        disabled={isDisabled}
        color="#007aff" // Couleur standard pour les boutons
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    // Permet un bon affichage en mode web (sur desktop)
    maxWidth: 500, 
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    flex: 1, 
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});