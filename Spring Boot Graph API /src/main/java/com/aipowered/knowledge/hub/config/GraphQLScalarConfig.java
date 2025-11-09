package com.aipowered.knowledge.hub.config;

import graphql.scalars.ExtendedScalars;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.web.multipart.MultipartFile;

@Configuration
public class GraphQLScalarConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        // Create a simple Upload scalar that works with Spring's MultipartFile
        GraphQLScalarType uploadScalar = GraphQLScalarType.newScalar()
                .name("Upload")
                .description("A file part in a multipart request - maps to Spring MultipartFile")
                .coercing(new Coercing<MultipartFile, Void>() {
                    @Override
                    public Void serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        throw new CoercingSerializeException("Upload scalar is input-only");
                    }

                    @Override
                    public MultipartFile parseValue(Object input) {
                        if (input instanceof MultipartFile mpf) {
                            return mpf;
                        }
                        throw new CoercingParseLiteralException("Expected a MultipartFile for Upload scalar");
                    }

                    @Override
                    public MultipartFile parseLiteral(Object input) throws CoercingParseLiteralException {
                        // File upload values are provided as variables, not as inline literals.
                        throw new CoercingParseLiteralException("Upload scalar literal parsing not supported");
                    }
                })
                .build();

        return wiringBuilder -> wiringBuilder.scalar(uploadScalar);
    }
}