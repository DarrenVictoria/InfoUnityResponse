import * as tf from '@tensorflow/tfjs';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Minimum requirements per person per day
const MINIMUM_REQUIREMENTS = {
    water: 2,          // liters per person per day
    rice: 0.3,         // kg per person per day (dry rations)
    dhal: 0.15,        // kg per person per day (dry rations)
    cannedFish: 0.1,   // cans per person per day (dry rations)
    milkPowder: 0.05,  // kg per person per day
    sugar: 0.05,       // kg per person per day
    tea: 0.02,         // kg per person per day
    biscuits: 0.1,     // packets per person per day
    soap: 0.1,         // bars per person per day
    toothpaste: 0.05   // tubes per person per day
};

class ResourcePredictor {
    constructor() {
        this.model = null;
        this.isModelTrained = false;
    }

    // Initialize the model architecture
    async initializeModel() {
        this.model = tf.sequential();

        // Input layer - 4 features (affectedPeople, affectedFamilies, casualties, duration)
        this.model.add(tf.layers.dense({
            inputShape: [4],
            units: 64,
            activation: 'relu'
        }));

        // Hidden layers
        this.model.add(tf.layers.dense({
            units: 32,
            activation: 'relu'
        }));

        // Output layer - 10 resources + foodPortions
        this.model.add(tf.layers.dense({
            units: 11,
            activation: 'relu' // Ensure non-negative outputs
        }));

        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError'
        });
    }

    // Fetch training data from Firestore
    async fetchTrainingData() {
        try {
            const querySnapshot = await getDocs(collection(db, 'ResourceData'));
            const trainingData = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();
                trainingData.push({
                    // Input features
                    inputs: [
                        data.totalDisplaced,
                        data.familiesAffected,
                        data.infrastructureDamage,
                        data.durationDays || 1 // Default to 1 day if not specified
                    ],
                    // Output targets (actual resources used)
                    outputs: [
                        data.actual.water,
                        data.actual.rice,
                        data.actual.dhal,
                        data.actual.cannedFish,
                        data.actual.milkPowder,
                        data.actual.sugar,
                        data.actual.tea,
                        data.actual.biscuits,
                        data.actual.soap,
                        data.actual.toothpaste,
                        data.actual.foodPortions || 0
                    ]
                });
            });

            return trainingData;
        } catch (error) {
            console.error('Error fetching training data:', error);
            throw error;
        }
    }

    // Train the model with available data
    async trainModel() {
        if (!this.model) {
            await this.initializeModel();
        }

        const trainingData = await this.fetchTrainingData();

        if (trainingData.length < 10) {
            console.log('Not enough training data (minimum 10 records required)');
            this.isModelTrained = false;
            return;
        }

        // Prepare input tensors
        const inputs = trainingData.map(data => data.inputs);
        const outputs = trainingData.map(data => data.outputs);

        const xs = tf.tensor2d(inputs);
        const ys = tf.tensor2d(outputs);

        await this.model.fit(xs, ys, {
            epochs: 100,
            batchSize: 32,
            callbacks: {
                onEpochEnd: async (epoch, logs) => {
                    console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
                },
            },
        });

        console.log('Model trained successfully');
        this.isModelTrained = true;
    }

    // Round values to practical amounts
    roundValues(resources) {
        return {
            water: Math.round(resources.water),
            rice: Math.round(resources.rice * 2) / 2, // Nearest 0.5 kg
            dhal: Math.round(resources.dhal * 2) / 2,
            cannedFish: Math.round(resources.cannedFish),
            milkPowder: Math.round(resources.milkPowder * 2) / 2,
            sugar: Math.round(resources.sugar * 2) / 2,
            tea: Math.round(resources.tea * 2) / 2,
            biscuits: Math.round(resources.biscuits),
            soap: Math.round(resources.soap),
            toothpaste: Math.round(resources.toothpaste),
            foodPortions: Math.round(resources.foodPortions)
        };
    }

    // Ensure minimum requirements are met
    applyMinimums(resources, people, duration) {
        return {
            water: Math.max(people * MINIMUM_REQUIREMENTS.water * duration, resources.water),
            rice: Math.max(people * MINIMUM_REQUIREMENTS.rice * duration, resources.rice),
            dhal: Math.max(people * MINIMUM_REQUIREMENTS.dhal * duration, resources.dhal),
            cannedFish: Math.max(people * MINIMUM_REQUIREMENTS.cannedFish * duration, resources.cannedFish),
            milkPowder: Math.max(people * MINIMUM_REQUIREMENTS.milkPowder * duration, resources.milkPowder),
            sugar: Math.max(people * MINIMUM_REQUIREMENTS.sugar * duration, resources.sugar),
            tea: Math.max(people * MINIMUM_REQUIREMENTS.tea * duration, resources.tea),
            biscuits: Math.max(people * MINIMUM_REQUIREMENTS.biscuits * duration, resources.biscuits),
            soap: Math.max(people * MINIMUM_REQUIREMENTS.soap * duration, resources.soap),
            toothpaste: Math.max(people * MINIMUM_REQUIREMENTS.toothpaste * duration, resources.toothpaste),
            foodPortions: resources.foodPortions
        };
    }

    // Calculate basic food supplies based on minimum requirements
    calculateBasicSupplies(humanEffect, foodType, duration) {
        const { affectedPeople } = humanEffect;
        const baseResources = {
            water: affectedPeople * MINIMUM_REQUIREMENTS.water * duration,
            milkPowder: affectedPeople * MINIMUM_REQUIREMENTS.milkPowder * duration,
            sugar: affectedPeople * MINIMUM_REQUIREMENTS.sugar * duration,
            tea: affectedPeople * MINIMUM_REQUIREMENTS.tea * duration,
            biscuits: affectedPeople * MINIMUM_REQUIREMENTS.biscuits * duration,
            soap: affectedPeople * MINIMUM_REQUIREMENTS.soap * duration,
            toothpaste: affectedPeople * MINIMUM_REQUIREMENTS.toothpaste * duration,
        };

        if (foodType === 'dryRations') {
            return {
                ...baseResources,
                rice: affectedPeople * MINIMUM_REQUIREMENTS.rice * duration,
                dhal: affectedPeople * MINIMUM_REQUIREMENTS.dhal * duration,
                cannedFish: affectedPeople * MINIMUM_REQUIREMENTS.cannedFish * duration,
                foodPortions: 0
            };
        }

        return {
            ...baseResources,
            rice: 0,
            dhal: 0,
            cannedFish: 0,
            foodPortions: affectedPeople * 3 * duration // 3 meals per person per day
        };
    }

    // Predict resources needed using the trained model or fallback to basic calculation
    async predictResources(humanEffect, foodType, duration = 1) {
        try {
            // Ensure we have a model
            if (!this.model) {
                await this.initializeModel();
            }

            // Try to train the model if we haven't already
            if (!this.isModelTrained) {
                await this.trainModel();
            }

            let predictedResources;

            if (this.isModelTrained) {
                // Prepare input tensor with duration
                const inputTensor = tf.tensor2d([
                    [
                        humanEffect.affectedPeople,
                        humanEffect.affectedFamilies,
                        humanEffect.injured + humanEffect.deaths + humanEffect.missing,
                        duration
                    ]
                ]);

                const prediction = this.model.predict(inputTensor);
                const predictedValues = prediction.dataSync();

                // Ensure no negative values
                const clamp = (value) => Math.max(0, value);

                predictedResources = {
                    water: clamp(predictedValues[0]),
                    rice: clamp(predictedValues[1]),
                    dhal: clamp(predictedValues[2]),
                    cannedFish: clamp(predictedValues[3]),
                    milkPowder: clamp(predictedValues[4]),
                    sugar: clamp(predictedValues[5]),
                    tea: clamp(predictedValues[6]),
                    biscuits: clamp(predictedValues[7]),
                    soap: clamp(predictedValues[8]),
                    toothpaste: clamp(predictedValues[9]),
                    foodPortions: clamp(predictedValues[10])
                };
            } else {
                // Fallback to basic calculation if model isn't trained
                predictedResources = this.calculateBasicSupplies(humanEffect, foodType, duration);
            }

            // Apply minimum requirements and round values
            const withMinimums = this.applyMinimums(
                predictedResources,
                humanEffect.affectedPeople,
                duration
            );

            return this.roundValues(withMinimums);

        } catch (error) {
            console.error('Prediction error:', error);
            // Fallback to basic calculation if prediction fails
            const fallback = this.calculateBasicSupplies(humanEffect, foodType, duration);
            return this.roundValues(
                this.applyMinimums(fallback, humanEffect.affectedPeople, duration)
            );
        }
    }
}

// Export a singleton instance
export const resourcePredictor = new ResourcePredictor();